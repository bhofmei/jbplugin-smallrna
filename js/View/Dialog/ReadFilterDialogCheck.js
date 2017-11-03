define("SmallRNAPlugin/View/Dialog/ReadFilterDialogCheck", [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dijit/focus',
    'dojo/_base/array',
    'dijit/form/NumberSpinner',
    'dijit/form/CheckBox',
    'JBrowse/View/Dialog/WithActionBar',
    'dojo/on',
    'dijit/form/Button',
    'SmallRNAPlugin/View/Track/_NamedFeatureFiltersMixin'
],
  function (
    declare,
    lang,
    dom,
    focus,
    array,
    dijitNumberSpinner,
    dijitCheckedMenuItem,
    ActionBarDialog,
    on,
    Button,
    NamedFeatureFiltersMixin
  ) {

    return declare(ActionBarDialog, {
      /**
       * Dijit Dialog subclass to change the min
       * and max score of XYPlots
       */

      //title: 'Filter all visible smRNA tracks',
      title: '<img src="plugins/SmallRNAPlugin/img/smrna-filter-blank.png" height="16px" width="16px" id="smrna-filter-dialog-img">Filter all visible smRNA tracks',
      //autofocus: false,

      constructor: function (args) {
        this.browser = args.browser;
        this.sizeProps = this._initializeSizeProperties(args);
        this.otherProps = this._initializeOtherProperties(args);

        this.isAnimal = args.config.isAnimal;

        this.setCallback = args.setCallback || function () {};
        this.cancelCallback = args.cancelCallback || function () {};
      },

      _initializeSizeProperties: function (args) {
        return {
          hide21: {
            id: 'hide21',
            hide: (args.config.hide21 === true ? true : undefined),
            'class': 'smrna-select-blue',
            label: 'Hide 21-mers'
          },
          hide22: {
            id: 'hide22',
            hide: (args.config.hide22 === true ? true : undefined),
            'class': 'smrna-select-green',
            label: 'Hide 22-mers'
          },
          hide23: {
            id: 'hide23',
            hide: (args.config.hide23 === true ? true : undefined),
            'class': 'smrna-select-purple',
            label: 'Hide 23-mers'
          },
          hide24: {
            id: 'hide24',
            hide: (args.config.hide24 === true ? true : undefined),
            'class': 'smrna-select-orange',
            label: 'Hide 24-mers'
          },
          hidepi: {
            id: 'hidepi',
            hide: (args.config.hidepi === true ? true : undefined),
            'class': 'smrna-select-red',
            label: 'Hide piRNAs'
          },
          hideOthers: {
            id: 'hideOthers',
            hide: (args.config.hideOthers === true ? true : undefined),
            'class': 'smrna-select-gray',
            label: 'Hide other sizes'
          }
        }
      },
      _initializeOtherProperties: function (args) {
        return {
          hideReverseStrand: {
            id: 'hidereverse',
            hide: (args.config.hideReverseStrand === true ? true : undefined),
            label: 'Hide reverse strand reads'
          },
          hideForwardStrand: {
            id: 'hideforward',
            hide: (args.config.hideForwardStrand === true ? true : undefined),
            label: 'Hide forward strand reads'
          },
          hideMultiMappers: {
            id: 'hidemulti',
            hide: (args.config.hideMultiMappers === true ? true : undefined),
            label: 'Hide multi-mapped alignments'
          },
          filterQuality: {
            id: 'filterquality',
            hide: (args.config.filterQuality === undefined ? 0 : args.config.filterQuality),
            label: 'Minimum mapping quality'
          }
        }
      },

      _fillActionBar: function (actionBar) {
        var ok_button = new Button({
          label: "OK",
          onClick: lang.hitch(this, function () {
            this.filterCallback();
            var out = {
              isAnimal: this.isAnimal
            };
            for (var size in this.sizeProps) {
              out[size] = this.sizeProps[size].hide;
            }
            for (var opt in this.otherProps) {
              out[opt] = this.otherProps[opt].hide;
            }
            this.setCallback && this.setCallback(out);
            this.hide();
          })
        }).placeAt(actionBar);

        var cancel_button = new Button({
          label: "Cancel",
          onClick: lang.hitch(this, function () {
            this.cancelCallback && this.cancelCallback();
            this.hide();
          })
        }).placeAt(actionBar);
      },

      filterCallback: function () {
        var dialog = this;
        var hide = lang.mixin(dialog.sizeProps, dialog.otherProps);
        var tracks = dialog.browser.view.visibleTracks();
        array.forEach(tracks, function (track) {
          // operate only on smAlignments tracks
          if (!/\b(smAlignments)/.test(track.config.type))
            return;
          for (var o in hide) {
            // handle quality filter info
            var h = hide[o].hide;
            if (h !== undefined)
              track._toggleFeatureFilter(o, h);
          }
        });
      },

      show: function (callback) {
        var dialog = this;
        dojo.addClass(this.domNode, 'smrna-filter-dialog');

        // left pane for filtering by size
        var leftPane = dom.create('div', {
          id: 'smrna-filter-dialog-sizes',
          'class': 'smrna-filter-dialog-column'
        });
        dom.create('h3', {
          innerHTML: 'Filter by size'
        }, leftPane);
        var size;
        for (size in this.sizeProps) {
          if (size == 'hidepi' & dialog.isAnimal !== true) {
            continue
          }
          var obj = dialog.sizeProps[size];
          var box = new dijitCheckedMenuItem({
            id: 'smrna-dialog-' + obj.id + '-box',
            title: obj.label,
            _prop: size,
            'class': obj.class,
            checked: (obj.hide === true ? true : false)
          });
          box.onClick = lang.hitch(this, '_setSizeProp', box);
          leftPane.appendChild(box.domNode);
          dom.create('label', {
            "for": 'smrna-dialog-' + obj.id + '-box',
            innerHTML: obj.label
          }, leftPane);
          leftPane.appendChild(dom.create('br'));
        }

        //Right pane - other filter types
        var rightPane = dom.create('div', {
          id: 'smrna-filter-dialog-others',
          'class': 'smrna-filter-dialog-column'
        });
        dom.create('h3', {
          innerHTML: 'Filter by other properties'
        }, rightPane);
        for (var opt in dialog.otherProps) {
          var obj = dialog.otherProps[opt];
          var box;
          if (opt === 'filterQuality') {
            box = new dijitNumberSpinner({
              id: 'smrna-dialog-' + obj.id + '-box',
              title: obj.label,
              _prop: opt,
              value: obj.hide,
              constraints: {
                min: 0,
                max: 255
              },
              smallDelta: 5,
              intermediateChanges: true,
              style: "width:50px;margin-right:5px;"
            });
            box.onChange = lang.hitch(this, '_setOtherProp', box);
          } else {
            box = new dijitCheckedMenuItem({
              id: 'smrna-dialog-' + obj.id + '-box',
              title: obj.label,
              _prop: opt,
              checked: (obj.hide === true ? true : false)
            });
            box.onClick = lang.hitch(this, '_setOtherProp', box);
          }
          rightPane.appendChild(box.domNode);
          dom.create('label', {
            "for": 'smrna-dialog-' + obj.id + '-box',
            innerHTML: obj.label
          }, rightPane);
          rightPane.appendChild(dom.create('br'));
        }

        this.set('content', [
            leftPane,
            rightPane
        ]);

        this.inherited(arguments);
        this.domNode.style.width = 'auto';
      },

      _setSizeProp: function (box) {
        if (this.sizeProps.hasOwnProperty(box._prop)) {
          this.sizeProps[box._prop]['hide'] = box.checked;
        }
      },
      _setOtherProp: function (box) {
        if (this.otherProps.hasOwnProperty(box._prop)) {
          this.otherProps[box._prop]['hide'] = (box.checked === undefined ? box.value : box.checked);
        }
      },

      hide: function () {
        this.inherited(arguments);
        window.setTimeout(lang.hitch(this, 'destroyRecursive'), 500);
      }
    });
  });
