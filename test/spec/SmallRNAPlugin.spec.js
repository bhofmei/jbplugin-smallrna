require([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Browser',
    'JBrowse/Store/SeqFeature/BAM',
    'JBrowse/Model/SimpleFeature',
    'SmallRNAPlugin/View/FeatureGlyph/smAlignment',
    'SmallRNAPlugin/View/Track/smAlignments',
    'SmallRNAPlugin/View/Track/smHTMLAlignments',
    'JBrowse/View/FeatureGlyph/Box'
    ], function (
    declare,
    array,
    Browser,
    bamStore,
    bamFeature,
    smAlignment,
    smAlignments,
    smHTMLAlignments,
    BoxGlyph
) {

    describe('Initial test', function () {
        var test = true;
        it('jasmine is working', function () {
            expect(test).toBe(true);
        });
    }); // end initial test

    describe('Track', function () {
        var track = new smAlignments({
            browser: new Browser({
                unitTestMode: true
            }),
            config: {
                urlTemplate: "../data/test_smrna_short_adjusted.bam",
                label: "testtrack"
            }
        });
        it('constructed', function () {
            expect(track).toBeTruthy();
        });
        it('isAnimal is false', function () {
            expect(track.config.isAnimal).toBe(false);
        });
    }); // end track

    describe('HTML Track', function () {
        var track = new smHTMLAlignments({
            browser: new Browser({
                unitTestMode: true
            }),
            config: {
                urlTemplate: "../data/test_smrna_short_adjusted.bam",
                label: "testtrack-html"
            }
        });
        it('constructed', function () {
            expect(track).toBeTruthy();
        });
    }); // end html track

    describe('Track with histograms', function () {
        var track = new smAlignments({
            browser: new Browser({
                unitTestMode: true
            }),
            config: {
                urlTemplate: "../data/test_smrna_short_adjusted.bam",
                label: "testtrack",
                histograms: {
                    urlTemplate: "../data/test_smrna_short.bw"
                }
            }
        });
        it('constructed', function () {
            expect(track).toBeTruthy();
        });
    }); // end describe track with histograms

    describe('Test features and filters', function () {
        var store = new bamStore({
            browser: new Browser({
                unitTestMode: true
            }),
            urlTemplate: '../data/test_smrna_short_adjusted.bam',
            refSeq: {
                name: 'Chr5',
                start: 0,
                end: 50001
            }
        });
        it('constructed', function () {
            expect(store).toBeTruthy();
        });
        var features = [];
        beforeEach(function (done) {
            store.getFeatures({
                start: 2500,
                end: 5000
            }, function (feature) {
                features.push(feature);
            }, function () {
                done();
            }, function (error) {
                console.error(error);
                done();
            });
        });
        afterEach(function () {
            features = [];
        });
        it('all features', function () {
            expect(features.length).toEqual(169);
        });
        describe('test filters', function () {
            it('len 24 filter', function () {
                var len24 = array.filter(features, function (f) {
                    return f.get('seq_length') === 24;
                });
                expect(len24.length).toBe(105);
            });

            it('len 22 filter', function () {
                var len22 = array.filter(features, function (f) {
                    return f.get('seq_length') === 22;
                });
                expect(len22.length).toBe(3);
            });

            it('plus strand filter', function () {
                var plusStrand = array.filter(features, function (f) {
                    return (f.get('strand') === "+" || f.get('strand') === 1);
                });
                expect(plusStrand.length).toBe(36);
            });

            it('sequence filter', function () {
                var seqTest = array.filter(features, function (f) {
                    return f.get('seq') === "TTGTGGTTGTTCTTAGGCTTCAGT";
                });
                expect(seqTest.length).toBe(5);
            });

            it('multimapped filter', function () {
                var multitest = array.filter(features, function (f) {
                    return f.get('nh') > 1;
                });
                expect(multitest.length).toBe(51);
            });

            it('quality filter', function () {


                var qualtest = array.filter(features, function (f) {
                    return (f.get('score') > 10 && f.get('score') <= 30);
                });
                expect(qualtest.length).toBe(71);
            });
        });
    });

});
