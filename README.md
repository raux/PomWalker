PomWalker
=========

This is a Maven POM parser. 

The parser works in 2 steps

1. Scanning - Give the location of the Maven Repo, we then scan and
pick up all POM file file paths. 

2. Reading - Once all the files are scanned, the program then goes back
and pulls each file, creates a POM model object.

Outputs are written in cvs format. Please refer tp files section below.

Dependencies
-------------

This parser uses the following artifacts. At this stage I have manually configured them in the
build file but plan to move to make dynamic.

apache-commons-net.jar
plexus-utils-3.0.15.jar
utils4j-0.7.0.jar
maven-model-3.1.1.jar

Files
------------------

Class MainWalker - Used as the main file with configurations.
 
# scanlog - file used to store the file paths of each POM file
# repo - path of where the Maven repository resides
# outF = variable that stores the outputfile name.. (outputPOM.csv)

Class FileScan - Used for scanning files

Class PomParser - used for parsing the POM files. 

##method printManagedModel - used to parse and extract dependencies of superPOM files
(those with managed dependencies)

##method printDep used to parse and extract dependencies of normal dependencies.



