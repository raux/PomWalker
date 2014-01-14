package PomWalker;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;

/**
 * 
 * @author Raula
 * This is to read and write files for scanning and other works
 */
public class ReadWriter {
	
	private String location;
	private String outFile;
	
	public ReadWriter(String target) {
		// TODO Auto-generated constructor stub
		location = target;
	}
	
	//public ReadWriter(String target, String outF) {
		// TODO Auto-generated constructor stub
		//location = target;
		//outFile = outF;
	//}

	public int countLine(){
		int count = 0;
		try (BufferedReader br = new BufferedReader(new FileReader(location)))
		{
	        String sCurrentLine;
			while ((sCurrentLine = br.readLine()) != null) {
				count++;
			}
 
		} catch (IOException e) {
			e.printStackTrace();
		} 
	
		return count;
	}
	
	public String readAtLine(int line){
		String sb = "null";
		int countLine = 0;
		try (BufferedReader br = new BufferedReader(new FileReader(location)))
		{
	        String sCurrentLine;
	        
			while ((sCurrentLine = br.readLine()) != null) {
				countLine++;
	            if (countLine == line){
	            	sb = sCurrentLine;
	            	break;
	            }
			}
 
		} catch (IOException e) {
			e.printStackTrace();
		} 
	
		return sb;
	}
	public void write(String lineWrite){
		BufferedWriter writer = null;
        try {
            //create a temporary file
            //String timeLog = new SimpleDateFormat("yyyyMMdd_HHmmss").format(Calendar.getInstance().getTime());
            File logFile = new File(location);

            // This will output the full path where the file will be written to...
            System.out.println(logFile.getCanonicalPath()+"-"+lineWrite);

            writer = new BufferedWriter(new FileWriter(logFile, true));
            writer.write(lineWrite);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                // Close the writer regardless of what happens...
                writer.close();
            } catch (Exception e) {
            }
        }
	}
	
	public void writeArti(String lineWrite, String artifact){
		BufferedWriter writer = null;
        try {
            //create a temporary file
            //String timeLog = new SimpleDateFormat("yyyyMMdd_HHmmss").format(Calendar.getInstance().getTime());
            File logFile = new File(artifact+"-"+location);

            // This will output the full path where the file will be written to...
            System.out.println(logFile.getCanonicalPath()+"-"+lineWrite);

            writer = new BufferedWriter(new FileWriter(logFile, true));
            writer.write(lineWrite);
            writer.write("\n");
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                // Close the writer regardless of what happens...
                writer.close();
            } catch (Exception e) {
            }
        }
	}

}
