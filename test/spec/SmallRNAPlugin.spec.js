require([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Browser',
    'JBrowse/Store/SeqFeature/BAM',
    'JBrowse/Model/XHRBlob',
    'SmallRNAPlugin/View/Track/smAlignments'
    ], function( 
        declare, 
        array,
        Browser,
        bamStore,
        XHRBlob,
        smAlignments
    ) {
    
    describe( 'Initial test', function() {
        var test = true;
        it('jasmine is working', function() {
            expect(test).toBe(true);
        });
    }); // end initial test
    
     describe( 'Track', function() {
        var track = new smAlignments({
            browser: new Browser({unitTestMode: true}),
            config: {
                urlTemplate: "../data/test_smrna_short.bam",
                label: "testtrack"
            }
        });
        it('constructed', function() {
            expect(track).toBeTruthy();
        });
        it('isAnimal is false', function(){
            expect(track.config.isAnimal).toBe(false); 
        });
    }); // end track
    
    describe( 'Track with histograms', function() {
        var track = new smAlignments({
            browser: new Browser({unitTestMode: true}),
            config: {
                urlTemplate: "../data/test_smrna_short.bam",
                label: "testtrack",
                histograms: {
                    urlTemplate: "../data/test_smrna_short.bw"
                }
            }
        });
        it('constructed', function() {
            expect(track).toBeTruthy();
        });
    }); // end describe track with histograms
    
    describe('Test features and filters', function(){
        var store = new bamStore({
            browser: new Browser({unitTestMode: true}),
            urlTemplate: '../data/test_smrna_short_manually_adjusted.bam',
            refSeq: { name: 'Chr5', start: 0, end: 50001 }
        });
        it('constructed', function() {
            expect(store).toBeTruthy();
        });
        var features = [];
        beforeEach(function(done){
            store.getFeatures({start:2500, end: 5000}, function(feature){
                features.push(feature);
            }, function(){
                done();
            }, function(error){
                console.error(error);
                done();
            });
        });
        afterEach(function(){
            features = [];
        });
        it('all features', function(){
            expect(features.length).toEqual(169);
        });
        it('test filters', function(){
            var len24 = array.filter(features, function(f) { return f.get('seq_length')===24; });
            var len22 = array.filter(features, function(f) { return f.get('seq_length')===22; });
            var plusStrand = array.filter(features, function(f) { return (f.get('strand')==="+" || f.get('strand')===1); });
            var seqTest = array.filter(features, function(f) { return f.get('seq')==="TTGTGGTTGTTCTTAGGCTTCAGT"; });
            var multitest = array.filter(features, function(f) { return f.get('supplementary_alignment'); });
            var qualtest = array.filter(features, function(f) { return (f.get('score')>10 && f.get('score')<=30 ); });

            expect(len24.length).toBe(105);
            expect(len22.length).toBe(3);
            expect(plusStrand.length).toBe(36);
            expect(seqTest.length).toBe(5);
            expect(multitest.length).toBe(14);
            expect(qualtest.length).toBe(76);

        });

    });

});

