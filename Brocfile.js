'use strict';

var autoprefixer     = require('autoprefixer-core');
var compileJSX       = require('broccoli-react');
var compileModules   = require('broccoli-es6-module-transpiler');
var concatTrees      = require('broccoli-concat');
var customProperties = require('postcss-custom-properties');
var mergeTrees       = require('broccoli-merge-trees');
var postcss          = require('./broccoli/postcss');
var unwatchedTree    = require('broccoli-unwatched-tree');
var Funnel           = require('broccoli-funnel');

var FileResolver    = require('es6-module-transpiler').FileResolver;
var NPMFileResolver = require('es6-module-transpiler-npm-resolver');

var config = require('./config');

// -----------------------------------------------------------------------------

function copy(tree, mappings) {
    var trees = Object.keys(mappings).map(function (srcDir) {
        var destDir = mappings[srcDir];
        return new Funnel(tree, {srcDir: srcDir, destDir: destDir});
    });

    return mergeTrees(trees);
}

// -- Shared -------------------------------------------------------------------

var shared = compileJSX('shared/');

// -- Server -------------------------------------------------------------------

var server = compileModules(shared, {
    description: 'ServerModules',
    formatter  : 'commonjs',
    output     : 'server/'
});

// -- Client -------------------------------------------------------------------

var node_modules = unwatchedTree('node_modules/');

var vendor = new Funnel('public/vendor/', {
    srcDir : '/',
    destDir: '/vendor'
});

var formatjsIntegrations = compileModules('public/vendor/formatjs/', {
    description: 'FormatJSModules',
    formatter  : 'bundle',
    output     : '/vendor/formatjs/integrations.js',
    sourceRoot : '/public/vendor/formatjs/',

    resolvers: [
        FileResolver,
        NPMFileResolver
    ]
});

var formatjsLocaleData = new Funnel(node_modules, {
    srcDir : 'react-intl/dist/locale-data',
    destDir: '/',

    files: config.availableLocales.map(function (locale) {
        return locale.split('-')[0] + '.js';
    })
});

formatjsLocaleData = concatTrees(formatjsLocaleData, {
    inputFiles: ['*.js'],
    outputFile: '/vendor/formatjs/locale-data.js'
});

var formatjs = mergeTrees([formatjsIntegrations, formatjsLocaleData]);

vendor = mergeTrees([
    copy(node_modules, {
        'components-ember'          : '/vendor/ember',
        'dustjs-linkedin/dist'      : '/vendor/dust',
        'ember-intl/packaging/dist' : '/vendor/ember-intl',
        'es6-shim'                  : '/vendor/es6-shim',
        'handlebars/dist'           : '/vendor/handlebars',
        'intl'                      : '/vendor/intl',
        'jquery/dist'               : '/vendor/jquery',
        'react/dist'                : '/vendor/react'
    }),

    vendor,
    formatjs
], {overwrite: true});

var pubRoot = new Funnel('public/', {
    srcDir : '/',
    destDir: '/',
    include: [/^[^/.]+\..+$/]
});

var css = new Funnel('public/css/', {
    srcDir : '/',
    destDir: '/css'
});

css = postcss(css, {
    processors: [
        customProperties(),
        autoprefixer()
    ]
});

var img = new Funnel('public/img/', {
    srcDir : '/',
    destDir: '/img'
});

var js = new Funnel('public/js/', {
    srcDir : '/',
    destDir: '/js'
});

js = compileModules(mergeTrees([shared, js]), {
    description: 'ClientModules',
    formatter  : 'bundle',
    output     : '/js/app.js',
    sourceRoot : '/public/'
});

var client = new Funnel(mergeTrees([vendor, pubRoot, css, img, js]), {
    srcDir : '/',
    destDir: 'client'
});

// -----------------------------------------------------------------------------

module.exports = mergeTrees([server, client]);
