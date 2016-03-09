# Small RNA Plugin

JBrowse plugin to support small RNA visualization

Based on the JBrowse tack type "Alignments2", the small RNA alignments track shows individual reads. The differences are:

1.  Reads are colored by size not strand  
2.  Reads can be filtered by size and/or multimapping  
3.  There is animal and plant specific coloring because plant's don't have piRNAs. Plant coloring is the default. 


##Install

For JBrowse 1.11.6+ in the _JBrowse/plugins_ folder, type:  
``git clone https://github.com/bhofmei/jbplugin-smallrna.git SmallRNAPlugin``


##Activate
Add this to jbrowse.conf under `[GENERAL]`:

    [ plugins.SmallRNAPlugin ]
    location = plugins/SmallRNAPlugin

If that doesn't work, add this to jbrowse_conf.json:

    "plugins" : {
        "SmallRNAPlugin" : { "location" : "plugins/SmallRNAPlugin" }
    }

##Plants vs Animals
The plant-specific smRNA color scheme is the default. However, if you want to use the animal-specific color scheme, it is very easy and flexible to change.
  
There is a priority scheme for the configuration. From highest priority to lowest, track-specific, dataset-specific, browser-specific, default plant  
For example, the entire browser could be set as _animal_ but a particular dataset could be _plant_ and a particular track within the plant dataset could be _animal_

To change for the entire **browser**, in jbrowse.conf

    [ plugins.SmallRNAPlugin ]
    location = plugins/SmallRNAPlugin
    isAnimal = true

or in jbrowse_conf.json

    "plugins" : {
        "SmallRNAPlugin" : { "location" : "plugins/SmallRNAPlugin",
        "isAnimal" : true }
    }

To change for a **dataset**, in the dataset's tracks.conf under `[GENERAl]`, add

    [plugins.SmallRNAPlugin]
    isAnimal = true

To change for a **track**, see below.

##Using small RNA Tracks
###File Formats
Reads are read directly from a BAM file. Follow the instructions for the Alignments2 track to specify the file location.  
Also, make sure the indexed BAM file (`.bam.bai`) is in the same directory as the BAM file.
Optionally, you can also supply a BigWig file for coverage view when zoomed out. I recommend this. Otherwise the track says "Too much data to show; zoom in to see detail"

###JSON Track Specifications
Track specifications are similar to the Alignments2 specifications. The _label_, _type_, and _urlTemplate_ must be specified. Take note of _type_; this is the difference from Alignments2.

To change the plant or animal coloring scheme, for the specific track, include the _isAnimal_ setting. Otherwise it assumes the setting based on the priority list.

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
An additional script to add these flags to an existing BAM/SAM file is being developed but is  not currently available.
