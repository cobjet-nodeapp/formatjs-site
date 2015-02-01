/* global React */

export default React.createClass({
    displayName: 'EmberOutput',

    propTypes: {
        source  : React.PropTypes.string.isRequired,
        context : React.PropTypes.object.isRequired,
        onChange: React.PropTypes.func
    },

    componentWillReceiveProps: function (nextProps) {
        if (nextProps.source !== this.props.source) {
            this.setState({});
        }

        Object.keys(nextProps).forEach(function (key) {
            if (key === 'locales') {
                Ember.set(this.service, 'locales', nextProps[key]);
            }

            this.controller.set(key, nextProps[key]);
        }, this);
    },

    localesChanged: function () {
        this.props.onChange(this.service.get('locales'));
    },

    componentWillUnmount: function () {
        this.service.off('localesChanged', this, this.localesChanged);
    },

    componentDidMount: function () {
        window.Ember.Application.initializer({
            name : this.props.exampleId,
            after: 'ember-intl-standalone',

            initialize: function (container, app) {
                var domElement = this.refs.placeholder.getDOMNode();
                var controller = this.controller = container.lookupFactory('controller:basic').create();

                this.service = container.lookup('intl:main');

                if (!container.has('view:default')) {
                    container.register('view:default', Ember.View);
                }

                this.service.on('localesChanged', this, this.localesChanged);

                controller.setProperties(Object.assign({}, this.props.context, {
                    locales  : this.props.locales,
                    formats  : this.props.formats,
                    messages : this.props.messages
                }));

                this.view = container.lookupFactory('view:default').create({
                    template   : Ember.Handlebars.compile(this.props.source),
                    controller : controller,
                    context    : controller
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
