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
           'SmallRNAPlugin/View/Track/_NamedFeatureFiltersMixin'
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
        var fmt = lang.hitch( this, function( name, value, feature ) {
            name = Util.ucFirst( name.replace(/_/g,' ') );
            return this.renderDetailField(container, name, value, feature);
        });
        fmt( 'Name', f.get('name'), f );
        fmt( 'Type', f.get('type'), f );
        // if score is undefined, that means it was originally 255
        var score = (f.get('score'));
        fmt( 'Score', (score === undefined ? 255 : score), f );
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
        /* multimapping */
        var mm = (f.get('supplementary_alignment') || (typeof f.get('xm')!='undefined'&&f.get('xm')>1) || (typeof f.get('nh') != 'undefined' && f.get('nh') > 1 ));
        fmt("Multimapped",mm,f);
        
        /* change filtering options to only capture the options we are interested in 
        seq, qual, supplementary_alignment, source, seq_length, NH, CIGAR, seq_reverse_complemented(?)*/
        var additionalTags = array.filter(
            f.tags(), function(t) {
                return {source:1,seq_length:1,NH:1,CIGAR:1,seq_reverse_complemented:1}[t.toLowerCase()];
            }
        );
        array.forEach( additionalTags, function(t) {
            if(t=="NH")
                fmt("Number mapped locations",f.get(t),f);
            else
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
            hideMultiMappers: {
                desc: 'Hide multi-mapped alignments',
                title: 'Show only uniquely aligned reads',
                func: function( f ) {
                    return ! (f.get('supplementary_alignment') || (typeof f.get('nh') != 'undefined' && f.get('nh') > 1 ) || (typeof f.get('xm')!='undefined'&&f.get('xm')>1));
                }
            },
            filterQuality: {
                desc: 'Filter by mapping quality',
                title: 'Set minimum mapping quality for visible reads',
                alwaysfilter: true,
                func: function( f ){
                    return ( (this.config.filterQuality === 0) || ((f.get('score') === undefined) || f.get('score') === 255 || f.get('score') >= this.config.filterQuality ))
                }
            },
            hideForwardStrand: {
                desc: 'Hide reads aligned to the forward strand',
                title:'Show/hide forward strand reads',
                func: function( f ) {
                    return f.get('strand') != 1;
                }
            },
            hideReverseStrand: {
                desc: 'Hide reads aligned to the reverse strand',
                title:'Show/hide reverse strand reads',
                func: function( f ) {
                    return f.get('strand') != -1;
                }
            },
            hide21:{
                desc: 'Hide 21-mers',
                title: 'Show/hide 21 bp-long reads',
                id: 'smrna-select-blue',
                func: function(f){
                    return f.get('seq_length') != 21;
                }
            },
            hide22:{
                desc: 'Hide 22-mers',
                title: 'Show/hide 22 bp-long reads',
                id: 'smrna-select-green',
                func: function(f){
                    return f.get('seq_length') != 22;
                }
            },
            hide23:{
                desc: 'Hide 23-mers',
                title: 'Show/hide 23 bp-long reads',
                id: 'smrna-select-purple',
                func: function(f){
                    return f.get('seq_length') != 23;
                }
            },
            hide24:{
                desc: 'Hide 24-mers',
                title: 'Show/hide 24 bp-long reads',
                id: 'smrna-select-orange',
                func: function(f){
                    return f.get('seq_length') != 24;
                }
            },
            hidepi:{
                desc: 'Hide piRNAs',
                title: 'Show/hide piRNAs (26-31 bp)',
                id: 'smrna-select-red',
                func: function(f){
                    return !(f.get('seq_length') > 25 && f.get('seq_length') < 32);
                }
            },
            hideOthers:{
                desc: 'Hide others',
                title: 'Show/hide all other sized reads',
                id: 'smrna-select-gray',
                func: function(f){
                    return this.config.isAnimal ? !(f.get('seq_length') < 21 || f.get('seq_length') > 31 || f.get('seq_length')==25) : !(f.get('seq_length') < 21 || f.get('seq_length') > 24);
                }
            }
        });
    },

    _alignmentsFilterTrackMenuOptions: function() {
        // add toggles for feature filters
        var track = this;
        return when( this._getNamedFeatureFilters() )
            .then( function( filters ) {
                var sizesAr = ['hide21','hide22','hide23','hide24'];
                if (track.config.isAnimal)
                    sizesAr.push('hidepi');
                sizesAr.push('hideOthers');
                return track._makeFeatureFilterTrackMenuItems(
                   [
                       'filterQuality',
                       'hideForwardStrand',
                       'hideReverseStrand',
                       'hideMultiMappers'
                   ],
                    sizesAr,
                   filters );
            });
    }

});
});
