package PomWalker;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

import org.apache.maven.model.Dependency;


public class MainWalker {
	
	public static void main(String[] args) {
	
		//scanlog refers to the scanned list of repositories
		
		//Environment Variables
		final String scanlog = "indexPom";
		final String repo = "/opt/maven/";
		//final String repo = "/opt/dmg/pom/";
		//final String repo = "C:\\\\Users\\Raula\\Documents\\maven";
		final String outF = "outputPom.csv";
		
        MainWalker pomWalk = new MainWalker();
        ReadWriter rw = new ReadWriter(scanlog);
        pomWalk.scan(rw,scanlog,repo);
        pomWalk.extractPom(rw,outF,arti,arVer);
		
    }

	//this is to run the program
	private void scan(ReadWriter rw, String pathScan, String repPath) {
		
		//STEP1 - extract all the POM files from the local repositories
		FileScan fw = new FileScan(pathScan);
        fw.walk(repPath);
        System.out.println("Walked POM files - "+rw.countLine());
	}
	
	private void extractPom(ReadWriter rw, String outFile, String art, String artID) {
		
        int totalPoms= rw.countLine();
        ReadWriter outF = new ReadWriter(outFile);
        //STEP2 - read each content and get all the dependencies
        PomParser pp = new PomParser();
        for (int i = 1; i < totalPoms+1; i++) {
        	outF.write(pp.walkParse(rw.readAtLine(i)));
		    
		}
        
        System.out.println("Walked POM files - "+totalPoms);
    	System.out.println("Independent artifacts: " + pp.skip );
    	System.out.println("Dependant artifacts: " + pp.anaPOM );

	}
}
