define( "SmallRNAPlugin/View/Dialog/ReadFilterDialog", [
    'dojo/_base/declare',
    'dojo/dom-construct',
    'dijit/focus',
    'dojo/_base/array',
    'dijit/form/TextBox',
    'dijit/form/CheckBox',
    'dijit/form/RadioButton',
    'JBrowse/View/Dialog/WithActionBar',
    'dojo/on',
    'dijit/form/Button',
    'JBrowse/Model/Location',
    'SmallRNAPlugin/View/Track/_NamedFeatureFiltersMixin',
    'SmallRNAPlugin/View/Track/_AlignmentsMixin'
],
function( declare, dom, focus, array, dijitTextBox, dijitCheckedMenuItem, dijitRadioButton, ActionBarDialog, on, Button, Location, NamedFeatureFiltersMixin, AlignmentMixin ) {

return declare (ActionBarDialog,{
    /**
    * Dijit Dialog subclass to change the min
    * and max score of XYPlots
    */

    title: 'Set track score range',
    //autofocus: false,

    constructor: function( args ){
        this.browser = args.browser;
        this.hide21 = args.config.hide21;
        this.hide22 = args.config.hide22;
        this.isAnimal = args.config.isAnimal || false;
        
        this.setCallback    = args.setCallback || function() {};
        this.cancelCallback = args.cancelCallback || function() {};
        this._optionDict = {hide21: '21-mers', hide22:'22-mers', hide23:'23-mers', hide24:'24-mers',hidepi:'piRNAs',hideOthers:'Hide other smRNAs'};
    },

    _fillActionBar: function( actionBar ){
        var ok_button = new Button({
        label: "OK",
        onClick: dojo.hitch(this, function() {
            this.filterCallback();
            this.setCallback && this.setCallback( this.hide21, this.hide22 );
            this.hide();
        })
    }).placeAt(actionBar);

    var cancel_button = new Button({
        label: "Cancel",
        onClick: dojo.hitch(this, function() {
            this.cancelCallback && this.cancelCallback();
            this.hide();
        })
    }).placeAt(actionBar);
    },

    filterCallback: function(){
        var dialog = this;
        //dialog.browser.hide21 = dialog.hide21;
        var hide21 = dialog.hide21;
        var hide22 = dialog.hide22;
        
        var tracks = dialog.browser.view.visibleTracks();
        console.log(tracks.length, dialog.hide21);
        array.forEach( tracks, function( track ) {
            // operate only on smAlignments tracks
            if( ! /\b(smAlignments)/.test( track.config.type ) )
                return;
            track._toggleFeatureFilter('hide21',hide21);
            track._toggleFeatureFilter('hide22',hide22);
        });
    },

    show: function( callback ) {
        var dialog = this;
        dojo.addClass( this.domNode, 'smrna-filter-dialog' );
        //console.log(this);
        /*var hide21Box = new dijitCheckedMenuItem({
            id: 'smrna-dialog-hide21-box',
            title: 'Hide 21-mers',
            class: 'smrna-select-blue',
            checked: dialog.hide21,
            onClick: function(event){
                dialog.hide21 = this.checked;
            }
        });
        var hide22Box = new dijitCheckedMenuItem({
            id: 'smrna-dialog-hide22-box',
            title: 'Hide 22-mers',
            class: 'smrna-select-green',
            checked: dialog.hide22,
            onClick: function(event){
                dialog.hide22 = this.checked;
            }
        });*/
        var table = dialog._createRadioTable(dialog);
        this.set('content', [
            dom.create('h3',{innerHTML:'Filter by size for all visible smRNA tracks'}),
            table
           /* hide21Box.domNode,
            dom.create('label',{"for":'smrna-dialog-hide21-box',innerHTML: 'Hide 21-mers'}),
            dom.create('br'),
            hide22Box.domNode,
            dom.create('label',{"for":'smrna-dialog-hide22-box',innerHTML: 'Hide 22-mers'})*/
        ] );

        this.inherited( arguments );
    },

    hide: function() {
        this.inherited(arguments);
        window.setTimeout( dojo.hitch( this, 'destroyRecursive' ), 500 );
    },
    
    _createRadioTable: function(dialog){
        var thisB = this;
        var table = dom.create('table',{id:'smrna-filter-dialog-table'});
        // header
        dom.create('tr',{innerHTML:'<th></th>\n<th>Hide</th>\n<th>Show</th>\n<th>Don\'t apply</th>'}, table);
        thisB._create21Row(dialog, table);
        return table;
    },
    
    _create21Row: function(dialog,table){
        var row = dom.create('tr',{id:'smra-filter-dialog-row-hide21'}, table);
        dom.create('td',{class:'smrna-filter-dialog-row-label',innerHTML: '21-mers'}, row);
        var hide = dom.create('td',{},row);
        hide.addChild(
            new dijitRadioButton({
            class:'smrna-select-blue',
            name:'smrna-21mer-hide',
            checked: !!dialog.hide21,
            onClick: function(event){
                dialog.hide21 = this.checked;
            }
            })
        );
        
        var show = new dijitRadioButton({
            class:'smrna-select-blue',
            name:'smrna-21mer-show',
            checked: !dialog.hide21,
            onClick: function(event){
                dialog.hide21 = !this.checked;
            }
        });
        var show2 = dom.create('td',{},row);
        show2.addChild(show);
        
        var na = new dijitRadioButton({
            class:'smrna-select-blue',
            name:'smrna-21mer-na',
            checked: dialog.hide21=== undefined,
            onClick: function(event){
                dialog.hide21 = (this.checked ? undefined : dialog.hide21 );
            }
        });
        var na2 = dom.create('td',{},row);
        na2.addChild(na);
    }
});
});