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
    'SmallRNAPlugin/View/Track/smAlignments',
      'JBrowse/Plugin'
       ],
       function(
           declare,
            array,
            lang,
            Alignments,
           JBrowsePlugin
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
    } // end constructor
});
});