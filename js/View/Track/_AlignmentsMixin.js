/**
 * Based on JBrowse _AlignmentsMixin
 * customized for smallRNA data
 * specifically, fewer track menu options, different colors, less details
 */
define("SmallRNAPlugin/View/Track/_AlignmentsMixin", [
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/_base/lang',
           'dojo/when',
           'JBrowse/Util',
           'JBrowse/Store/SeqFeature/_MismatchesMixin',
           'JBrowse/View/Track/_NamedFeatureFiltersMixin'
        ],
        function(
            declare,
            array,
            lang,
            when,
            Util,
            MismatchesMixin,
            NamedFeatureFiltersMixin
        ) {

return declare([ MismatchesMixin, NamedFeatureFiltersMixin ], {

    /**
     * Make a default feature detail page for the given feature.
     * @returns {HTMLElement} feature detail page HTML
     */
    defaultFeatureDetail: function( /** JBrowse.Track */ track, /** Object */ f, /** HTMLElement */ div ) {
        var container = dojo.create('div', {
            className: 'detail feature-detail feature-detail-'+track.name.replace(/\s+/g,'_').toLowerCase(),
            innerHTML: ''
        });
        var fmt = dojo.hitch( this, function( name, value, feature ) {
            name = Util.ucFirst( name.replace(/_/g,' ') );
            return this.renderDetailField(container, name, value, feature);
        });
        fmt( 'Name', f.get('name'), f );
        fmt( 'Type', f.get('type'), f );
        fmt( 'Score', f.get('score'), f );
        fmt( 'Description', f.get('note'), f );
        fmt(
            'Position',
            Util.assembleLocString({ start: f.get('start'),
                                     end: f.get('end'),
                                     ref: this.refSeq.name })
            + ({'1':' (+)', '-1': ' (-)', 0: ' (no strand)' }[f.get('strand')] || ''),
            f
        );


        if( f.get('seq') ) {
            fmt('Sequence and Quality', this._renderSeqQual( f ), f );
        }

        var additionalTags = array.filter(
            f.tags(), function(t) {
                return ! {name:1,score:1,start:1,end:1,strand:1,note:1,subfeatures:1,type:1}[t.toLowerCase()];
            }
        ).sort();

        dojo.forEach( additionalTags, function(t) {
                          fmt( t, f.get(t), f );
        });

        return container;
    },

    // takes a feature, returns an HTML representation of its 'seq'
    // and 'qual', if it has at least a seq. empty string otherwise.
    _renderSeqQual: function( feature ) {

        var seq  = feature.get('seq'),
            qual = feature.get('qual') || '';
        if( !seq )
            return '';

        qual = qual.split(/\s+/);

        var html = '';
        for( var i = 0; i < seq.length; i++ ) {
            html += '<div class="basePosition" title="position '+(i+1)+'"><span class="seq">'
                    + seq[i]+'</span>';
            if( qual[i] )
                html += '<span class="qual">'+qual[i]+'</span>';
            html += '</div>';
        }
        return '<div class="baseQuality">'+html+'</div>';
    },

    // recursively find all the stylesheets that are loaded in the
    // current browsing session, traversing imports and such
    _getStyleSheets: function( inSheets ) {
        var outSheets = [];
        array.forEach( inSheets, function( sheet ) {
            outSheets.push( sheet );
            array.forEach( sheet.cssRules || sheet.rules, function( rule ) {
                if( rule.styleSheet )
                    outSheets.push.apply( outSheets, this._getStyleSheets( [rule.styleSheet] ) );
            },this);
        },this);
        return outSheets;
    },

    // filters for BAM alignments according to some flags
    /* this function needs updated */
    _getNamedFeatureFilters: function() {
        return lang.mixin( {}, this.inherited( arguments ),
            {
                /*hideSupplementary: {
                    desc: 'Hide supplementary alignments',
                    func: function( f ) {
                        return ! f.get('supplementary_alignment');
                    }
                },*/
                hideForwardStrand: {
                    desc: 'Hide reads aligned to the forward strand',
                    func: function( f ) {
                        return f.get('strand') != 1;
                    }
                },
                hideReverseStrand: {
                    desc: 'Hide reads aligned to the reverse strand',
                    func: function( f ) {
                        return f.get('strand') != -1;
                    }
                },
                show21:{
                    desc: 'Show 21-mers',
                    func: function(f){
                        return f.get('seq_length') == 21;
                    },
                    title: 'Hide/show reads 21 bp long'
                },
                show22:{
                    desc: 'Show 22-mers',
                    func: function(f){
                        return f.get('seq_length') == 22;
                    }
                },
                show23:{
                    desc: 'Show 23-mers',
                    func: function(f){
                        return f.get('seq_length') == 23;
                    }
                },
                show24:{
                    desc: 'Show 24-mers',
                    func: function(f){
                        return f.get('seq_length') == 24;
                    }
                },
                showpi:{
                    desc: 'Show piRNAs',
                    func: function(f){
                        var l = f.get('seq_length');
                        return l > 25 && l < 32;
                    }
                },
                showOther:{
                    desc: 'Show others',
                    func: function(f){
                        var l = f.get('seq_length');
                        return l < 21 || l == 25 || l > 31;
                    }
                },
                showOthers:{
                    desc: 'Show others',
                    func: function(f){
                        var l = f.get('seq_length');
                        return l < 21 || l > 24;
                    }
                }
            });
    },

    /* this function needs updated */
    _alignmentsFilterTrackMenuOptions: function() {
        // add toggles for feature filters
        var track = this;
        return when( this._getNamedFeatureFilters() )
            .then( function( filters ) {
                       var menuAr = ['show21','show22','show23','show24' ];
                        if(track.config.useAnimal)
                            menuAr.push('showpi','showOther');
                        else
                            menuAr.push('showOthers');
                        console.log(menuAr);
                        menuAr.push('hideForwardStrand','hideReverseStrand')
                       return track._makeFeatureFilterTrackMenuItems(
                           menuAr,
                           filters );
                   });
    }

});
});
