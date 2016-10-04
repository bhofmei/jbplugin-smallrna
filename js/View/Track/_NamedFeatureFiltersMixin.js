define("SmallRNAPlugin/View/Track/_NamedFeatureFiltersMixin", [
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/when',
    'SmallRNAPlugin/View/Dialog/QualityFilterDialog'
       ],
       function(
           declare,
           array,
           when,
        QualityFilterDialog
       ) {
return declare( null, {
    constructor: function() {
        this._initializeConfiguredFeatureFilters();
        this.alwaysfilter = ['filterQuality'];
    },

    _initializeConfiguredFeatureFilters: function() {
        // initialize toggling feature filters
        var thisB = this;
        return when( this._getNamedFeatureFilters() )
            .then( function( filters ) {
                       for( var filtername in filters ) {
                           if( thisB.config[filtername] )
                               thisB.addFeatureFilter( filters[filtername].func, filtername );
                           else
                               thisB.removeFeatureFilter( filtername );
                       }
                   });
    },

    _toggleFeatureFilter: function( filtername, setActive ) {
        var thisB = this;
        var isAlwaysFilter = thisB.alwaysfilter.indexOf(filtername);
        // if no setActive, we will toggle it
        if( setActive === undefined )
            setActive = ! this.config[filtername];

        // nothing to do if not changed
        if( !!setActive === !!this.config[filtername] && isAlwaysFilter === -1)
            return;

        this.config[filtername] = setActive;

        var thisB = this;
        when( this._getNamedFeatureFilters(),
              function( filters ) {
                  if( setActive )
                      thisB.addFeatureFilter( filters[filtername].func, filtername );
                  else
                      thisB.removeFeatureFilter( filtername );

                  thisB.changed();
              });
    },

    _getNamedFeatureFilters: function() {
        return {};
        // return lang.mixin(
        //     {},
        //     this.inherited(arguments),
        //     {

        //     });
    },
    
    _makeFeatureFilterTrackMenuItems: function( names, sizes, filters ) {
        var thisB = this;
        return when( filters || this._getNamedFeatureFilters() )
            .then( function( filters ) {
                var out = [];
                out.push({
                    label: 'Filter by Size',
                    iconClass: "dijitIconPackage",
                    title: 'filter reads by size',
                    children: array.map(
                               sizes,
                               function( name ) {
                                   return thisB._makeFeatureFilterTrackMenuItemSizes( name, filters[name] );
                               })
                });
                out = out.concat(array.map(
                               names,
                               function( name ) {
                                   return thisB._makeFeatureFilterTrackMenuItem( name, filters[name] );
                               })
                );
                return out;
            });
    },

    _makeFeatureFilterTrackMenuItem: function( filtername, filterspec ) {
        var thisB = this;
        if( filtername == 'SEPARATOR' )
            return { type: 'dijit/MenuSeparator' };
        // quality filter requires dialog box
        else if(filtername == 'filterQuality'){
            return {
                label: filterspec.desc,
                title: filterspec.title,
                iconClass: 'dijitIconFilter',
                action: function(){
                    new QualityFilterDialog({
                        min_quality: thisB.config.filterQuality,
                        setCallback: function(min_quality){
                            thisB._toggleFeatureFilter( filtername, min_quality );
                        }
                    }).show();
                }
            }
        }
        // all other filters
        return { label: filterspec.desc,
                 title: filterspec.title,
                 type: 'dijit/CheckedMenuItem',
                 checked: !! thisB.config[filtername],
                 onClick: function(event) {
                     thisB._toggleFeatureFilter( filtername, this.checked );
                 }
               };
    },
    _makeFeatureFilterTrackMenuItemSizes: function( filtername, filterspec ) {
        var thisB = this;
        if( filtername == 'SEPARATOR' )
            return { type: 'dijit/MenuSeparator' };
        return { label: filterspec.desc,
                 title: filterspec.title,
                 type: 'dijit/CheckedMenuItem',
                className:filterspec.id,
                 checked: !! thisB.config[filtername],
                 onClick: function(event) {
                     thisB._toggleFeatureFilter( filtername, this.checked );
                 }
               };
    }

});
});
