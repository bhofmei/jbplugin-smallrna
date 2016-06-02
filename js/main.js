require({cache:{
'JBrowse/Plugin':function(){
define("JBrowse/Plugin", [
           'dojo/_base/declare',
           'JBrowse/Component'
       ],
       function( declare, Component ) {
return declare( Component,
{
    constructor: function( args ) {
        this.name = args.name;
        this.cssLoaded = args.cssLoaded;
        this._finalizeConfig( args.config );
    },

    _defaultConfig: function() {
        return {
            baseUrl: '/plugins/'+this.name
        };
    }
});
});
}}});
define('SmallRNAPlugin/main',[ 
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojo/dom-construct',
    'dijit/form/Button',
    'dojo/fx',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/on',
    'dojo/query',
    'dojo/dom-geometry',
    'JBrowse/Plugin',
    'dijit/MenuItem',
    "JBrowse/Browser",
    'SmallRNAPlugin/View/Track/smAlignments',
    'SmallRNAPlugin/View/Dialog/ReadFilterDialogCheck'
],
function(
    declare,
    array,
    lang,
    Deferred,
    domConstruct,
    dijitButton,
    coreFx,
    dom,
    style,
    on,
    query,
    domGeom,
    JBrowsePlugin,
    dijitMenuItem,
    Browser,
    Alignments,
    smReadFilterDialog
){
 
return declare( JBrowsePlugin,
{
    constructor: function( args ) { 
        var baseUrl = this._defaultConfig().baseUrl;
        var thisB = this;
        var browser = this.browser;
        
        // isAnimal is off by default
        this.config.isAnimal = false;
        if( typeof args.isAnimal != 'undefined' && !!(args.isAnimal) ){
            this.config.isAnimal = !!(args.isAnimal);
        }
        // toolbar button
        browser.afterMilestone('initView',function(){
            var navBox = dojo.byId("navbox");
            browser.smRNAButton = new dijitButton({
                title: "Filter small RNA reads",
                id: 'smrna-filter-btn',
                width: '22px',
                onClick: function(){
                    new smReadFilterDialog({
                        browser: browser,
                        config: thisB.config,
                        setCallback(options){
                            thisB.config = options;
                        }
                    }).show();
                }
            }, dojo.create('button',{},navBox))
        });
    } // end constructor
});
});