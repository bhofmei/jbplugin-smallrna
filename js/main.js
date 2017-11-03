define('SmallRNAPlugin/main', [
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojo/dom-construct',
    'dijit/form/Button',
    'dijit/registry',
    'dojo/fx',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/on',
    'dojo/query',
    'dojo/dom-geometry',
    'JBrowse/Plugin',
    'JBrowse/Util',
    'dijit/MenuItem',
    "JBrowse/Browser",
    './View/Track/smAlignments',
  './View/Track/smHTMLAlignments',
    './View/Dialog/ReadFilterDialogCheck'
],
  function (
    declare,
    array,
    lang,
    Deferred,
    domConstruct,
    dijitButton,
    dijitRegistry,
    coreFx,
    dom,
    style,
    on,
    query,
    domGeom,
    JBrowsePlugin,
    Util,
    dijitMenuItem,
    Browser,
    Alignments,
    HTMLAlignments,
    smReadFilterDialog
  ) {

    return declare(JBrowsePlugin, {
      constructor: function (args) {
        this.config.version = '1.4.1';
        console.log('SmallRNAPlugin starting - v' + this.config.version);
        var baseUrl = this._defaultConfig().baseUrl;
        var thisB = this;
        var browser = this.browser;

        // isAnimal is off by default
        this.config.isAnimal = false;
        if (browser.config.isAnimal === true || args.isAnimal === true) {
          this.config.isAnimal = true;
        }
        this.config.dialog = false;
        if (args.dialogMode === true) {
          this.config.dialog = true;
        }
        if (this.config.isAnimal) {
          lang.extend(Alignments, {
            _isAnimal: thisB._isAnimal
          });
          lang.extend(HTMLAlignments, {
            _isAnimal: thisB._isAnimal
          });
        }
        // toolbar button
        browser.afterMilestone('initView', function () {
          var navBox = dom.byId("navbox");
          browser.smRNAButton = new dijitButton({
            title: "Filter small RNA reads",
            id: 'smrna-filter-btn',
            width: '22px',
            onClick: function () {
              new smReadFilterDialog({
                browser: browser,
                config: thisB.config,
                setCallback: function (options) {
                  thisB.config = options;
                }
              }).show();
            }
          }, domConstruct.create('button', {}, navBox))
        });

        // handle dialog mode
        console.log(JSON.stringify(this.config.dialog));
        if (this.config.dialog) {
          browser.afterMilestone('completely initialized', function () {
            if (browser.view.tracks.length < 1) {
              setTimeout(function () {
                var button = dijitRegistry.byId('smrna-filter-btn');
                button.onClick();
              }, 700)
            }
          }); // end milestone completely initialized
        }
      }, // end constructor

      _isAnimal: function () {
        return true;
      }

    });
  });
