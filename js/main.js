define('SmallRNAPlugin/main', [
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojo/dom-construct',
    'dijit/form/Button',
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
    'SmallRNAPlugin/View/Track/smAlignments',
    'SmallRNAPlugin/View/Dialog/ReadFilterDialogCheck'
],
  function (
    declare,
    array,
    lang,
    Deferred,
    domConstruct,
    dijitButton,
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
    smReadFilterDialog
  ) {

    return declare(JBrowsePlugin, {
      constructor: function (args) {
        console.log('SmallRNAPlugin starting');
        var baseUrl = this._defaultConfig().baseUrl;
        var thisB = this;
        var browser = this.browser;
        this.config.version = '1.4.0';

        // isAnimal is off by default
        this.config.isAnimal = false;
        if (browser.config.isAnimal === true || args.config.isAnimal === true) {
          this.config.isAnimal = true;
        }
        if (this.config.isAnimal) {
          lang.extend(Alignments, {
            _isAnimal: thisB._isAnimal
          });
          /*lang.extend(HTMLAlignments, {
            _isAnimal: thisB._isAnimal
          });*/
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
                setCallback: function(options) {
                  thisB.config = options;
                }
              }).show();
            }
          }, domConstruct.create('button', {}, navBox))
        });
      }, // end constructor

      _isAnimal: function () {
        return true;
      }

    });
  });
