# Release Notes

## [v1.4.3] - 2017-11-02
- UPDATED small rna colors
  - 21: blue
  - 22: green
  - 23: purple
  - 24: orange
  - piRNAs: red
  - other: gray
- FIXED minor bug with opacity in details dialog

## [v1.4.2] - 2017-10-02
- ADDED dialog mode to take screenshots of filtering dialog

## [v1.4.1] - 2017-08-17
- minor bug fixes

## [v1.4.0] - 2017-08-08
- ADDED an HTMLFeature style track to compliment the default canvas style track
- this is mainly useful for screenshots so reads are div objects not painted on the canvas

## [v1.3.1] - 2016-10-04
- FIXED issue with filtering when changing between multiple non-zero values
- FIXED some labels to be "mapping quality" not "quality score" to minimize possible confusion

## [v1.3.0] - 2016-09-26
- ADDED filtering option to filter by minimum quality score of reads
- Able to filter per track or across all tracks

## [v1.2.3] - 2016-09-24
- UPDATED Handle isAnimal better to match MethylationPlugin

## [v1.2.2] - 2016-09-23
- ADDED Option to solid-fill multimappers which will be useful for screenshots if user does not want multimappers to appear different

## [v1.2.1] - 2016-09-19
- FIXED issue with track check boxes IDs that prevented filtering on multiple tracks

## [v1.2.0] - 2016-06-10
- Reads are organized on the y-axis by strand; positive reads on positive-strand y-axis and negative-strand reads on negative y-axis
- Also includes "max height exceeded" warning independently for the positive and negative y-axis
- In order to accommodate more data, the individual reads are smaller than the default heights for RNA-seq reads

## [v1.1.0] - 2016-06-02
- ADDED Filtering dialog for all visible tracks
  - Only works on visible tracks and only changes features in which the check box was clicked
  - Colored checkboxes

## [v1.0.4] - 2016-04-03
- FIXED issue with coloring of multi mapped reads; now show transparency when multimapped

## [v1.0.3] - 2016-03-25
- FIXED Correctly display multimapping status in the read detail pop-up

## [v1.0.2] - 2016-03-18
- ADDED Use XM attribute (with sam flag and/or NH attribute) to determine if a read is multi mapped

## [v1.0.1] - 2016-03-14
- UPDATED coloring

## [v1.0.0] - 2016-03-09
- First production ready version
- Supports coloring and filtering of reads by size
- Supports animal vs non-animal smRNA scheme (animal includes piRNAs which are 26-31 bp)
- Supports coloring and filtering based on multimapped status