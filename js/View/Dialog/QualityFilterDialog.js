define( "SmallRNAPlugin/View/Dialog/QualityFilterDialog", [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dijit/focus',
    'dijit/form/NumberSpinner',
    'JBrowse/View/Dialog/WithActionBar',
    'dojo/on',
    'dijit/form/Button'
],
function(
    declare,
    lang,
    domConstruct,
    focus,
    dijitNumberSpinner,
    ActionBarDialog,
    on,
    Button
) {

return declare ( ActionBarDialog,{
    /**
     * Dijit Dialog subclass to change the min
     * and max score of XYPlots
     */

     title: 'Set minimum mapping quality',
    //autofocus: false,

     constructor: function( args ){
        this.browser = args.browser;
        this.min_quality = args.minQuality || 0;
        this.setCallback = args.setCallback || function() {};
        this.cancelCallback = args.cancelCallback || function() {};
        this.scoreConstraints = {min: 0, max: 100};
     },

     _fillActionBar: function( actionBar ){
        var ok_button = new Button({
            label: "OK",
            onClick: lang.hitch(this, function() {
                var min_quality = this.minQualityText.value;
                this.setCallback && this.setCallback( min_quality );
                this.hide();
            })
        }).placeAt(actionBar);

        var cancel_button = new Button({
            label: "Cancel",
            onClick: lang.hitch(this, function() {
                this.cancelCallback && this.cancelCallback();
                this.hide();
            })
        }).placeAt(actionBar);
     },

    show: function( callback ) {
        dojo.addClass( this.domNode, 'smrna-track-quality-dialog' );

        this.minQualityText = new dijitNumberSpinner({
            id: 'smrna-track-min-quality',
            value: this.min_quality,
            constraints: this.scoreConstraints,
            smallDelta: 5,
            intermediateChanges: true,
            style:"width:75px;margin-left:5px;"
        });
        this.set('content', [
            domConstruct.create('label', { "for": 'smrna-track-min-quality', innerHTML: 'Min Mapping Quality' } ),
            this.minQualityText.domNode
        ] );

        this.inherited( arguments );
    },

    hide: function() {
        this.inherited(arguments);
        window.setTimeout( lang.hitch( this, 'destroyRecursive' ), 500 );
    }
});
});
