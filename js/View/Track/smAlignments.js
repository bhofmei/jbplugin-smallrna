define( "SmallRNAPlugin/View/Track/smAlignments", [
            'dojo/_base/declare',
            'dojo/_base/array',
            'dojo/promise/all',
            'JBrowse/Util',
            'SmallRNAPlugin/View/Track/CanvasFeatures',
            //'JBrowse/View/Track/CanvasFeatures',
            'SmallRNAPlugin/View/Track/_AlignmentsMixin'
        ],
        function(
            declare,
            array,
            all,
            Util,
            CanvasFeatureTrack,
            AlignmentsMixin
        ) {

return declare( [ CanvasFeatureTrack, AlignmentsMixin ], {
    
    constructor: function(arguments){
        // priority inhertiance of the isAnimal option
        // check track listing first, then plugin settings
        if(typeof arguments.config.isAnimal != 'undefined' ){
            this.config.isAnimal = arguments.config.isAnimal;
        }else if(typeof this.browser.plugins.SmallRNAPlugin.config.isAnimal != 'undefined'){
            this.config.isAnimal = this.browser.plugins.SmallRNAPlugin.config.isAnimal;
        }else{
            // should never need to reach this though
            this.config.isAnimal = false;
        }
    },

    _defaultConfig: function() {
        var c = Util.deepUpdate(
            dojo.clone( this.inherited(arguments) ),
            {
                glyph: 'SmallRNAPlugin/View/FeatureGlyph/smAlignment',
                maxFeatureGlyphExpansion: 0,
                maxFeatureScreenDensity: 6,
                hideMultiMappers: false,
                hideForwardStrand: false,
                hideReverseStrand: false,
                hide21: false,
                hide22: false,
                hide23: false,
                hide24: false,
                hidepi: false,
                hideOthers: false,

                histograms: {
                    description: 'coverage depth',
                    binsPerBlock: 200
                },

                style: {
                    showLabels: false,
                    label: "seq_length",
                    description: false
                }
            }
        );
        return c;
    },

    _trackMenuOptions: function() {
        var track=this;
        var displayOptions=[];
        return all([ this.inherited(arguments),  this._alignmentsFilterTrackMenuOptions(), displayOptions ])
            .then( function( options ) {
                       var o = options.shift();
                       options.unshift({ type: 'dijit/MenuSeparator' } );
                       return o.concat.apply( o, options );
                   });
    }

});
});
