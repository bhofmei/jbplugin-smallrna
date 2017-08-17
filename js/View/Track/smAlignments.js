define("SmallRNAPlugin/View/Track/smAlignments", [
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/promise/all',
  'dojo/dom-construct',
  'dojo/dom-class',
  'dojo/Deferred',
  'JBrowse/Util',
  'SmallRNAPlugin/View/StrandedBitmapRectLayout',
  'JBrowse/View/Track/CanvasFeatures',
  'SmallRNAPlugin/View/Track/_AlignmentsMixin'
        ],
  function (
    declare,
    array,
    all,
    domConstruct,
    domClass,
    Deferred,
    Util,
    Layout,
    CanvasFeatureTrack,
    AlignmentsMixin
  ) {

    return declare([CanvasFeatureTrack, AlignmentsMixin], {

      constructor: function (args) {},

      _defaultConfig: function () {
        var thisB = this;
        var c = Util.deepUpdate(
          dojo.clone(this.inherited(arguments)), {
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
            maxHeight: 400,
            filterQuality: 0,
            isAnimal: thisB._isAnimal(),

            histograms: {
              description: 'coverage depth',
              binsPerBlock: 200
            },

            style: {
              showLabels: false,
              label: "seq_length",
              description: false,
              origin_color: 'black',
              clip_marker: true,
              solidFill: false
            }
          }
        );
        return c;
      },

      _isAnimal: function () {
        return false;
      },

      /* Functions from Canvas tracks that need to be changed for small-rna specific purposes */
      _getLayout: function (scale) {
        if (!this.layout || this._layoutpitchX != 4 / scale) {
          // if no layoutPitchY configured, calculate it from the
          // height and marginBottom (parseInt in case one or both are functions), or default to 3 if the
          // calculation didn't result in anything sensible.
          var pitchY = this.getConf('layoutPitchY') || 4;
          this.layout = new Layout({
            pitchX: 4 / scale,
            pitchY: pitchY,
            maxHeight: this.getConf('maxHeight'),
            displayMode: this.displayMode
          });
          this._layoutpitchX = 4 / scale;
        }

        return this.layout;
      },

      fillFeatures: function (args) {
        var thisB = this;

        var blockIndex = args.blockIndex;
        var block = args.block;
        var blockWidthPx = block.domNode.offsetWidth;
        var scale = args.scale;
        var leftBase = args.leftBase;
        var rightBase = args.rightBase;
        var finishCallback = args.finishCallback;

        var fRects = [];

        // count of how many features are queued up to be laid out
        var featuresInProgress = 0;
        // promise that resolved when all the features have gotten laid out by their glyphs
        var featuresLaidOut = new Deferred();
        // flag that tells when all features have been read from the
        // store (not necessarily laid out yet)
        var allFeaturesRead = false;

        var errorCallback = dojo.hitch(thisB, function (e) {
          this._handleError(e, args);
          finishCallback(e);
        });

        var layout = this._getLayout(scale);

        // query for a slightly larger region than the block, so that
        // we can draw any pieces of glyphs that overlap this block,
        // but the feature of which does not actually lie in the block
        // (long labels that extend outside the feature's bounds, for
        // example)
        var bpExpansion = Math.round(this.config.maxFeatureGlyphExpansion / scale);

        var region = {
          ref: this.refSeq.name,
          start: Math.max(0, leftBase - bpExpansion),
          end: rightBase + bpExpansion
        };
        this.store.getFeatures(region,
          function (feature) {
            if (thisB.destroyed || !thisB.filterFeature(feature))
              return;
            fRects.push(null); // put a placeholder in the fRects array
            featuresInProgress++;
            var rectNumber = fRects.length - 1;

            // get the appropriate glyph object to render this feature
            thisB.getGlyph(
              args,
              feature,
              function (glyph) {
                // have the glyph attempt
                // to add a rendering of
                // this feature to the
                // layout
                //console.log('feature', JSON.stringify(feature.data));
                var fRect = glyph.layoutFeature(
                  args,
                  layout,
                  feature
                );
                if (fRect === null) {
                  // could not lay out, would exceed our configured maxHeight for negative strand
                  // mark the block as exceeding the max height
                  block.maxHeightExceededBottom = true;
                } else if (fRect === undefined) {
                  // could not layout because would exceed for postive strand
                  // mark as exceeding top max height
                  block.maxHeightExceededTop = true;
                } else {
                  // laid out successfully
                  if (!(fRect.l >= blockWidthPx || fRect.l + fRect.w < 0))
                    fRects[rectNumber] = fRect;
                }

                // this might happen after all the features have been sent from the store
                if (!--featuresInProgress && allFeaturesRead) {
                  featuresLaidOut.resolve();
                }
              },
              errorCallback
            );
          },

          // callback when all features sent
          function () {
            if (thisB.destroyed)
              return;

            allFeaturesRead = true;
            if (!featuresInProgress && !featuresLaidOut.isFulfilled()) {
              featuresLaidOut.resolve();
            }

            featuresLaidOut.then(function () {

              var totalHeight = layout.getTotalHeight();
              var c = block.featureCanvas =
                domConstruct.create(
                  'canvas', {
                    height: totalHeight,
                    width: block.domNode.offsetWidth + 1,
                    style: {
                      cursor: 'default',
                      height: totalHeight + 'px',
                      position: 'absolute'
                    },
                    innerHTML: 'Your web browser cannot display this type of track.',
                    className: 'canvas-track'
                  },
                  block.domNode
                );
              var ctx = c.getContext('2d');

              // finally query the various pixel ratios
              var ratio = Util.getResolution(ctx, thisB.browser.config.highResolutionMode);
              // upscale canvas if the two ratios don't match
              if (thisB.browser.config.highResolutionMode != 'disabled' && ratio >= 1) {

                var oldWidth = c.width;
                var oldHeight = c.height;

                c.width = oldWidth * ratio;
                c.height = oldHeight * ratio;

                c.style.width = oldWidth + 'px';
                c.style.height = oldHeight + 'px';

                // now scale the context to counter
                // the fact that we've manually scaled
                // our canvas element
                ctx.scale(ratio, ratio);
              }

              //console.log(block.maxHeightExceededBottom,block.maxHeightExceededTop);
              // bottom overflow, aka negative strand
              if (block.maxHeightExceededBottom)
                thisB.markBlockHeightOverflow(block, false);
              if (block.maxHeightExceededTop)
                thisB.markBlockHeightOverflow(block, true);

              thisB.heightUpdate(totalHeight,
                blockIndex);

              thisB.renderFeatures(args, fRects);

              thisB.renderClickMap(args, fRects);
              // add origin
              thisB.renderOrigin(args, layout.getOriginY());

              finishCallback();
            });
          },
          errorCallback
        );
      },

      markBlockHeightOverflow: function (block, top) {
        if (block.heightOverflowedBottom && !(top))
          return;
        else if (block.heightOverflowedTop && top)
          return;
        // don't draw if we turned off clip markers
        if (!this.config.style.clip_marker)
          return;
        if (top)
          block.heightOverflowedTop = true;
        else
          block.heightOverflowedBottom = true;

        var topHeight = (top ? 0 : this.height - 16);
        block.heightOverflowed = true;
        domClass.add(block.domNode, 'height_overflow');
        domConstruct.create('div', {
          className: 'smrna_height_overflow_message' + (top ? '_top' : '_bottom'),
          innerHTML: 'Max height reached',
          style: {
            top: (topHeight) + 'px',
            height: '16px'
          }
        }, block.domNode);
      },

      renderOrigin: function (args, originY) {
        var canvas = args.block.featureCanvas;
        var ctx = this.getRenderingContext(args);
        if (ctx) {
          var originColor = this.config.style.origin_color;
          if (typeof originColor == 'string' && !{
              'none': 1,
              'off': 1,
              'no': 1,
              'zero': 1
            }[originColor]) {
            ctx.fillStyle = originColor;
            ctx.fillRect(0, originY, canvas.width, 1);
          }
        }
      },

      _trackMenuOptions: function () {
        var track = this;
        var displayOptions = [];
        return all([this.inherited(arguments), this._alignmentsFilterTrackMenuOptions(), displayOptions])
          .then(function (options) {
            var o = options.shift();
            options.unshift({
              type: 'dijit/MenuSeparator'
            });
            return o.concat.apply(o, options);
          });
      }
    });
  });
