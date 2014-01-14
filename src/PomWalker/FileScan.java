package PomWalker;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;

//This class is used to extract the POM files and locations within
//
public class FileScan{
	
	private String writeLocation;
	
	public FileScan(String target){
		writeLocation = target;
	}

    public void walk( String path) {
        ReadWriter wr = new ReadWriter(writeLocation);
        
    	File root = new File( path );
        File[] list = root.listFiles();

        if (list == null) return;

        //lets see if we can list the files that have extension *.pom
        for ( File f : list ) {
            if ( f.isDirectory() ) {
                walk( f.getAbsolutePath() );
            }
            else {
            	
            	String lookFile = f.getAbsoluteFile().toString();
            	
            	
            	if (getExtension(lookFile).equalsIgnoreCase("pom")){
                	
                	SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd"); 
                	File jarF = new File(lookFile);
                	//File jarF = new File(lookFile.replace(".pom", ".jar"));
                	System.out.println(jarF.toString());
                	Date d = new Date (jarF.lastModified());
                	
                	lookFile = lookFile.replace("\\","\\\\");
                	System.out.println(sdf1.format(d)+","+lookFile );
                	wr.write(sdf1.format(d)+","+lookFile);
                	wr.write("\n");
                	//write to file
                	
            	}
            }
        }
    }
    
    protected String getExtension(String name) {
        String[] str = name.split("\\.");
        if(str.length > 1) {
            return str[str.length - 1];
        }
        return ""; //-- no extension
    }

    //public static void main(String[] args) {
       // FileScan fw = new FileScan();
        //fw.walk("C:\\Users\\Raula\\Documents\\maven" );
    //}
}
