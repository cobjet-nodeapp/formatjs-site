/* global React */

export default React.createClass({
    displayName: 'EmberOutput',

    propTypes: {
        source  : React.PropTypes.string.isRequired,
        context : React.PropTypes.object.isRequired
    },

    injectMessages: function (locale, messages) {
      var container  = this.container;
      var lookupName = locale.toLowerCase();

      if (container.has('locale:' + lookupName)) {
          container.unregister('locale:' + lookupName);
      }

      container.register('locale:' + lookupName, Ember.Object.extend({
          locale:   locale,
          messages: messages
      }));
    },

    componentWillReceiveProps: function (nextProps) {
        if (nextProps.source !== this.props.source) {
            this.setState({});
        }

        var locale = Ember.get(nextProps, 'locales');

        if (typeof locale === 'string') {
            this.injectMessages(locale, nextProps.messages);
            this.app.intl.set('locales', Ember.makeArray(locale));
        }

        this.controller.setProperties(nextProps);
    },

    componentDidMount: function () {
        var domElement = this.refs.placeholder.getDOMNode();
        var locales    = Ember.makeArray(this.props.locales);

        this.app = Ember.Application.extend().create({
            rootElement: domElement,
            ready: function () {
                this.intl.setProperties({
                    locales:        locales,
                    defaultLocales: ['en-US']
                });
            }
        });

        this.app.initializer({
            name : this.props.exampleId,
            after: 'ember-intl-standalone',

            initialize: function (container, app) {
                var controller = this.controller = container.lookupFactory('controller:basic').create(this.props.context);
                this.container = container;

                this.injectMessages(this.props.locales.toLowerCase(), this.props.messages);

                this.view = Ember.View.create({
                    template  : Ember.Handlebars.compile(this.props.source),
                    context   : controller,
                    container : container
                });

                this.view.appendTo(domElement);
            }.bind(this)
        });
    },

    render: function () {
        return (
            <div ref="placeholder" className="handlebars-output" />
        );
    }
});
