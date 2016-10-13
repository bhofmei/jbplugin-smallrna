# Small RNA Plugin

JBrowse plugin to support small RNA visualization

Based on the JBrowse tack type "Alignments2", the small RNA alignments track shows individual reads. The differences are:

1.  Reads are colored by size not strand  
2.  Reads can be filtered by size and/or multimapping  
3.  There is animal and plant specific coloring because plant's don't have piRNAs. Plant coloring is the default.
4.  Reads are organized on a y-axis by strand with positive-strand reads above the y-axis origin and negative-strand reads below it.


##Install

For JBrowse 1.11.6+ in the _JBrowse/plugins_ folder, type:  
``git clone https://github.com/bhofmei/jbplugin-smallrna.git SmallRNAPlugin``

**or**

downloaded the latest release version at [releases](https://github.com/bhofmei/jbplugin-smallrna/releases).  
Unzip the downloaded folder, place in _JBrowse/plugins_, and rename the folder _SmallRNAPlugin_

##Activate
Add this to _jbrowse.conf_ under `[GENERAL]`:

    [ plugins.SmallRNAPlugin ]
    location = plugins/SmallRNAPlugin

If that doesn't work, add this to _jbrowse_conf_.json:

    "plugins" : {
        "SmallRNAPlugin" : { "location" : "plugins/SmallRNAPlugin" }
    }

##Plants vs Animals
The plant-specific smRNA color scheme is the default. However, if you want to use the animal-specific color scheme, it is very easy and flexible to change.  This is compatible with the [DNA Methylation plugin](https://github.com/bhofmei/jbplugin-methylation).
  
Using the animal coloring scheme is enforced hierarchically. Configurations specified at a higher level overpower lower-level specification. If not specified at a specific level, inherits the setting of the level below. 

| level| location | syntax|
|--|--|--|
|*highest* | individual track config | `isAnimal=true` |
| | `tracks.conf` | `[general]`<br>`isAnimal=true` |
| | `jbrowse.conf` | `[general]` <br> `isAnimal=true` |
|*lowest*| **default** | `isAnimal=false`|

Note that toolbar buttons are defined by `tracks.conf` and `jbrowse.conf`.

##Using small RNA Tracks
###File Formats
Reads are read directly from a BAM file. Follow the instructions for the Alignments2 track to specify the file location.  
Also, make sure the indexed BAM file (`.bam.bai`) is in the same directory as the BAM file.
Optionally, you can also supply a BigWig file for coverage view when zoomed out. I recommend this. Otherwise the track says "Too much data to show; zoom in to see detail"

###JSON Track Specifications
Track specifications are similar to the Alignments2 specifications. The _label_, _type_, and _urlTemplate_ must be specified. Take note of _type_; this is the difference from Alignments2.

To change the plant or animal coloring scheme, for the specific track, include the _isAnimal_ setting. Otherwise it assumes the setting based on the priority list above.

In trackList.json,

    {
        "key" : "Small RNA",
        "label" : "smrna",
        "storeClass" : "JBrowse/Store/SeqFeature/BAM",
        "urlTemplate" : "path/to/smallrna.bam",
        "type" : "SmallRNAPlugin/View/Track/smAlignments",
        "isAnimal" : true
    }

In tracks.conf,

    [tracks.smrna]
    key = Small RNA
    storeClass = JBrowse/Store/SeqFeature/BAM
    urlTemplate = path/to/smallrna.bam
    type = SmallRNAPlugin/View/Track/smAlignments
    isAnimal = true

##Multimapping
Traditionally, for small RNA analysis is important to know if a read maps uniquely or multiple times within the genome. In this plugin, multi-mapped reads are shown in the appropriate color for the length, but are more transparent.  
Reads are determined to be multi mapped based on the SAM flag (read is supplementary) or the SAM attribute `NH`. Even when multiple alignments for the same read are output in the BAM file, the mapping program may not set the flag or `NH` attribute. For example, bowtie does not set these even when `-k 2+`.
An additional script to add these flags to an existing BAM/SAM file is being developed but is not currently available.

##Quality Filtering
Mapping programs vary greatly in how they assign quality scores for reads, the `MQ` or `MAPQ` score. 
From the [SAM format specification](http://samtools.github.io/hts-specs/SAMv1.pdf),
  > MAPQ: MAPping Quality. It equals −10 log10 Pr{mapping position is wrong}, rounded to the nearest
integer. A value 255 indicates that the mapping quality is not available.

To accommodate as many scoring schemes as possible, users can filter by minimum quality score.

Reads with value 255 are always shown.

##Future Plans
The following features plan to be supported in the future.
- Create a complementary HTML Track type (compared to canvas type currently used)
- Create script to assign multimapping correctly