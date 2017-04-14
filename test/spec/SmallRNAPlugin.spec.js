require([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Browser',
    'SmallRNAPlugin/View/Track/smAlignments'
    ], function( 
        declare, 
        array,
        Browser,
        smAlignments
    ) {
    
    describe( 'Initial test', function() {
        var test = true;
        it('jasmini is working', function() {
            expect(test).toBe(true);
        });
    }); // end initial test
    
     describe( 'Track', function() {
        var track = new smAlignments({
            browser: new Browser({unitTestMode: true}),
            config: {
                urlTemplate: "../data/wt-smrna_chr5_short.bam",
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
                urlTemplate: "../data/wt-smrna_chr5_short.bam",
                label: "testtrack",
                histograms: {
                    urlTemplate: "../data/wt-smrna_chr5_short.bw"
                }
            }
        });
        it('constructed', function() {
            expect(track).toBeTruthy();
        });
    }); // end describe track with histograms
    

});

