define("SmallRNAPlugin/View/Track/smHTMLAlignments", [
  'dojo/_base/declare',
            'dojo/_base/array',
  'dojo/_base/lang',
            'dojo/promise/all',
            'dojo/dom-construct',
            'dojo/dom-class',
            'dojo/Deferred',
            'JBrowse/Util',
            'SmallRNAPlugin/View/StrandedBitmapRectLayout',
            'JBrowse/View/Track/HTMLFeatures',
            'SmallRNAPlugin/View/Track/_AlignmentsMixin'
        ],
  function (
    declare,
    array,
    lang,
    all,
    domConstruct,
    domClass,
    Deferred,
    Util,
    Layout,
    HTMLFeatures,
    AlignmentsMixin
  ) {

    return declare([HTMLFeatures, AlignmentsMixin], {

      constructor: function (args) {
        this.glyphHeight = 4;
      },

      _defaultConfig: function () {
        var thisB = this;
        var c = Util.deepUpdate(
          lang.clone(this.inherited(arguments)), {
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

            style: {
              _defaultLabelScale: 50,
              className: 'smrna-alignment',
              arrowheadClass: 'arrowhead',
              origin_color: 'black',
              centerChildrenVertically: true,
              showSubfeatures: false,
              showLabels: false,
              clip_marker: 'black'
            }
          }
        );
        return c;
      },

      _isAnimal: function () {
        return false;
      },


      /* Functions from html tracks that need to be changed for small-rna specific purposes */
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
            displayMode: 'normal'
          });
          this._layoutpitchX = 4 / scale;
        }

        return this.layout;
      },

      fillFeatures: function (args) {
        var blockIndex = args.blockIndex;
        var block = args.block;
        var leftBase = args.leftBase;
        var rightBase = args.rightBase;
        var scale = args.scale;
        var stats = args.stats;
        var containerStart = args.containerStart;
        var containerEnd = args.containerEnd;
        var finishCallback = args.finishCallback;
        var browser = this.browser;


        this.scale = scale;

        block.featureNodes = {};

        //determine the glyph height, arrowhead width, label text dimensions, etc.
        if (!this.haveMeasurements) {
          this.measureStyles();
          this.haveMeasurements = true;
        }

        var curTrack = this;

        var featCallback = lang.hitch(this, function (feature) {
          var uniqueId = feature.id();
          if (!this._featureIsRendered(uniqueId)) {
            if (this.filterFeature(feature)) {

              // hook point
              var render = 1;
              if (typeof this.renderFilter === 'function')
                render = this.renderFilter(feature);

              if (render === 1) {
                this.addFeatureToBlock(feature, uniqueId, block, scale, containerStart, containerEnd);
              }
            }
          }
        });

        this.store.getFeatures({
            ref: this.refSeq.name,
            start: leftBase,
            end: rightBase
          },
          featCallback,
          function (args) {
            curTrack.heightUpdate(curTrack._getLayout(scale).getTotalHeight(),
              blockIndex);
            if (args && args.maskingSpans) {
              //note: spans have to be inverted
              var invSpan = [];
              invSpan[0] = {
                start: leftBase
              };
              var i = 0;
              for (var span in args.maskingSpans) {
                if (args.maskingSpans.hasOwnProperty(span)) {
                  span = args.maskingSpans[span];
                  invSpan[i].end = span.start;
                  i++;
                  invSpan[i] = {
                    start: span.end
                  };
                }
              }
              invSpan[i].end = rightBase;
              if (invSpan[i].end <= invSpan[i].start) {
                invSpan.splice(i, 1);
              }
              if (invSpan[0].end <= invSpan[0].start) {
                invSpan.splice(0, 1);
              }
              curTrack.maskBySpans(invSpan, args.maskingSpans);
            }
            if (block.maxHeightExceededBottom)
              curTrack.markBlockHeightOverflow(block, false)
            if (block.maxHeightExceededTop)
              curTrack.markBlockHeightOverflow(block, true);
            curTrack.renderOrigin(block, curTrack.layout.getOriginY());
            finishCallback();
          },
          function (error) {
            console.error(error, error.stack);
            curTrack.fillBlockError(blockIndex, block, error);
            finishCallback();
          }
        );
      },
      renderFeature: function (feature, uniqueId, block, scale, containerStart, containerEnd) {
        //featureStart and featureEnd indicate how far left or right
        //the feature extends in bp space, including labels
        //and arrowheads if applicable

        var featureEnd = feature.get('end');
        var featureStart = feature.get('start');
        if (typeof featureEnd == 'string')
          featureEnd = parseInt(featureEnd);
        if (typeof featureStart == 'string')
          featureStart = parseInt(featureStart);
        // layoutStart: start genome coord (at current scale) of horizontal space need to render feature,
        //       including decorations (arrowhead, label, etc) and padding
        var layoutStart = featureStart;
        // layoutEnd: end genome coord (at current scale) of horizontal space need to render feature,
        //       including decorations (arrowhead, label, etc) and padding
        var layoutEnd = featureEnd;

        var strand = feature.get('strand');

        var levelHeight = this.glyphHeight + this.glyphHeightPad;

        layoutEnd += Math.max(1, this.padding / scale);

        var top = this._getLayout(scale)
          .addRect(uniqueId,
            layoutStart,
            layoutEnd,
            levelHeight,
            feature);

        if (top === null || top === undefined) {
          // could not lay out, would exceed our configured maxHeight
          // mark the block as exceeding the max height
          //if (top === null && block.maxHeightExceededBottom !== true)
          if (top === null)
            block.maxHeightExceededBottom = true;
          //else if(block.maxHeightExceededTop !== true)
          else
            block.maxHeightExceededTop = true;
          return null;
        }

        var featDiv = this.config.hooks.create(this, feature);
        this._connectFeatDivHandlers(featDiv);
        // NOTE ANY DATA SET ON THE FEATDIV DOM NODE NEEDS TO BE
        // MANUALLY DELETED IN THE cleanupBlock METHOD BELOW
        featDiv.track = this;
        featDiv.feature = feature;
        featDiv.layoutEnd = layoutEnd;

        // border values used in positioning boolean subfeatures, if any.
        featDiv.featureEdges = {
          s: Math.max(featDiv.feature.get('start'), containerStart),
          e: Math.min(featDiv.feature.get('end'), containerEnd)
        };

        // (callbackArgs are the args that will be passed to callbacks
        // in this feature's context menu or left-click handlers)
        featDiv.callbackArgs = [this, featDiv.feature, featDiv];


        block.featureNodes[uniqueId] = featDiv;

        // hook point
        if (typeof this.featureHook1 === 'function')
          this.featureHook1(feature, featDiv);

        // record whether this feature protrudes beyond the left and/or right side of the block
        if (layoutStart < block.startBase) {
          if (!block.leftOverlaps) block.leftOverlaps = [];
          block.leftOverlaps.push(uniqueId);
        }
        if (layoutEnd > block.endBase) {
          if (!block.rightOverlaps) block.rightOverlaps = [];
          block.rightOverlaps.push(uniqueId);
        }
        // update
        domClass.add(featDiv, "feature");
        var className = this.config.style.className;
        domClass.add(featDiv, className);
        var seqLen = feature.get('seq_length');
        // pi rnas
        if (seqLen > 25 && seqLen < 32 && this.config.isAnimal)
          domClass.add(featDiv, 'smrna-' + 'pi');
        // other
        else if (seqLen < 21 || seqLen >= 25)
          domClass.add(featDiv, 'smrna-' + 'other');
        // otherwise it's fine
        else
          domClass.add(featDiv, 'smrna-' + seqLen);


        // check multimapping
        if (feature.get('supplementary_alignment') || (typeof feature.get('xm') != 'undefined' && feature.get('xm') > 1) || (typeof feature.get('nh') != 'undefined' && feature.get('nh') > 1)) {
          if (!this.config.style.solidFill)
            domClass.add(featDiv, 'multimapped-read');
        }

        // Since some browsers don't deal well with the situation where
        // the feature goes way, way offscreen, we truncate the feature
        // to exist betwen containerStart and containerEnd.
        // To make sure the truncated end of the feature never gets shown,
        // we'll destroy and re-create the feature (with updated truncated
        // boundaries) in the transfer method.
        var displayStart = Math.max(featureStart, containerStart);
        var displayEnd = Math.min(featureEnd, containerEnd);
        var blockWidth = block.endBase - block.startBase;
        var featwidth = Math.max(this.minFeatWidth, (100 * ((displayEnd - displayStart) / blockWidth)));
        featDiv.style.cssText =
          "left:" + (100 * (displayStart - block.startBase) / blockWidth) + "%;" +
          "top:" + top + "px;" +
          " width:" + featwidth + "%;" +
          (this.config.style.featureCss ? this.config.style.featureCss : "");

        // Store the containerStart/End so we can resolve the truncation
        // when we are updating static elements
        featDiv._containerStart = containerStart;
        featDiv._containerEnd = containerEnd;

        // fill in the template parameters in the featDiv and also for the labelDiv (see below)
        var context = lang.mixin({
          track: this,
          feature: feature,
          callbackArgs: [this, feature]
        });
        if (featDiv.title) {
          featDiv.title = this.template(feature, this._evalConf(context, featDiv.title, "label"));
        }

        // render the popup menu if configured
        if (this.config.menuTemplate) {
          window.setTimeout(lang.hitch(this, '_connectMenus', featDiv), 50 + Math.random() * 150);
        }

        if (typeof this.config.hooks.modify == 'function') {
          this.config.hooks.modify(this, feature, featDiv);
        }

        return featDiv;
      },

      addFeatureToBlock: function (feature, uniqueId, block, scale,
        containerStart, containerEnd) {
        var featDiv = this.renderFeature(feature, uniqueId, block, scale,
          containerStart, containerEnd);
        if (!featDiv)
          return null;

        block.domNode.appendChild(featDiv);
        if (this.config.style.centerChildrenVertically)
          this._centerChildrenVertically(featDiv);
        return featDiv;
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

      renderOrigin: function (block, originY) {
        var originColor = this.config.style.origin_color;
        if (typeof originColor == 'string' && !{
            'none': 1,
            'off': 1,
            'no': 1,
            'zero': 1
          }[originColor]) {
          var origin = domConstruct.create('div', {
            style: {
              background: originColor,
              height: '1px',
              width: '100%',
              top: originY + 'px'
            },
            className: 'feature'
          }, block.domNode);
          //block.domNode.addChild(origin);
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
