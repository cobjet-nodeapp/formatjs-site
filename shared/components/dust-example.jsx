/* global React */

import ExampleMixin from '../mixins/example';
import CodeBlock from './code-block';
import LocaleSelect from './locale-select';
import DustOutput from './dust-output';
import {Tabs, Tab} from './tabs';

export default React.createClass({
    displayName: 'DustExample',
    mixins     : [ExampleMixin],

    statics: {
        renderCode: [
            'dust.render(template, context, function(err, html) {',
            '    // Put `html` into the DOM or use it otherwise...',
            '});'
        ].join('\n')
    },

    genderateRenderCode: function () {
        var intlData = this.generateIntlData();

        return [
            'context.intl = ' + JSON.stringify(intlData, null, 4) + ';',
            '',
            this.constructor.renderCode
        ].join('\n');
    },

    render: function () {
        var example          = this.props.example;
        var currentLocale    = this.state.currentLocale;
        var availableLocales = this.state.availableLocales;
        var messages         = this.props.intl.messages[currentLocale];
        var message          = messages[example.meta.messageId];

        var tabs = [
            <Tab label="Template" key="template">
                <CodeBlock lang="dust">
                    {example.source.template}
                </CodeBlock>
            </Tab>,

            <Tab label="Context" key="context">
                <CodeBlock lang="javascript">
                    {example.source.context}
                </CodeBlock>
            </Tab>,

            <Tab label="Render" key="render">
                <CodeBlock lang="javascript">
                    {this.genderateRenderCode()}
                </CodeBlock>
            </Tab>
        ];

        // Insert a "Message" tab if the example uses an i18n message.
        if (message) {
            tabs.splice(1, 0,
                <Tab label="Message" key="message">
                    <CodeBlock highlight={false}>
                        {message}
                    </CodeBlock>
                </Tab>
            );
        }

        return (
            <div id={example.id} className="example">
                <div className="example-source">
                    <Tabs>
                        {tabs}
                    </Tabs>
                </div>

                <div className="example-output">
                    <h4 className="example-output-heading">Rendered</h4>

                    <DustOutput
                        exampleId={example.id}
                        locales={currentLocale}
                        formats={example.meta.formats}
                        messages={messages}
                        source={example.source.template}
                        context={this.evalContext(example.source.context)} />

                    <div className="example-output-controls">
                        <label>
                            <span className="example-label">Locale:</span>
                            <LocaleSelect
                                availableLocales={availableLocales}
                                value={currentLocale}
                                onChange={this.updateLocale} />
                        </label>
                    </div>
                </div>
            </div>
        );
    }
});
