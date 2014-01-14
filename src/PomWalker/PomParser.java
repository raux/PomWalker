package PomWalker;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.util.List;

import org.apache.maven.model.Dependency;
import org.apache.maven.model.DependencyManagement;
import org.apache.maven.model.Model;
import org.apache.maven.model.Parent;
import org.apache.maven.model.io.xpp3.MavenXpp3Reader;
import org.codehaus.plexus.util.xml.pull.XmlPullParserException;


public class PomParser {
	String modDate;
	int skip;
	int anaPOM;
	
	//get the POM file contents
	@SuppressWarnings("finally")
	public String walkParse(String log) {
		ReadWriter errlog = new ReadWriter("log.txt");
		String contents="";
		//ReadWriter rw = new ReadWriter();
		// Path to your local Maven repository
		
		String temp = log;
		String path = log.substring(temp.indexOf(",")+1);
		modDate=temp.substring(0,temp.indexOf(",")+1);
		
		//modDate = temp.substring(0, temp.indexOf(",")+1);
		final File pomXmlFile = new File(path.trim());
		
		System.out.println(path);
		
        try {
            final Reader reader = new FileReader(pomXmlFile);
            final Model model;
            try {
                final MavenXpp3Reader xpp3Reader = new MavenXpp3Reader();
                model = xpp3Reader.read(reader);
                              
                	
                	//contents = printDepAll(model, path);
                	if(model.getDependencyManagement()!=null){
                		contents = printManagedModel(model, path);
                	}else{
                		System.out.println("normal: "+path);
                		contents = printDepAll(model, path);
                	}
                	
                
                //contents = printDep(model, path, artifact, artVersion);
            } finally {
                reader.close();
            }
        } catch (XmlPullParserException ex) {
        		errlog.write(path+","+ex);
        		errlog.write("\n");
                throw new RuntimeException("Error parsing POM!", ex);
        } catch (final IOException ex) {
        		errlog.write(path+","+ex);
        		errlog.write("\n");
                throw new RuntimeException("Error reading POM!", ex);
        } finally {
        	 return contents;
        }
       
	}
		// Read the model for an artifact and a given version
		//final Model model = MavenPomReader.readModel(repositoryDir, "junit", "junit-3.7", "3.7");
		// Print the dependencies on the console
	//Print the dependencies
		@SuppressWarnings("unchecked")
		public String printManagedModel(Model m, String fp){
			//ReadWriter wr = new ReadWriter();
			System.out.println("trying managed dependencies"+fp);
			StringBuilder pomContents = new StringBuilder();
				
			DependencyManagement dm = m.getDependencyManagement();
			
			final List<Dependency> dependencies = dm.getDependencies();
			System.out.println(dependencies.size());
			
			//update counters
			if (dependencies.size() == 0){
				skip++;
			}else{
				System.out.println("got it");
				anaPOM++;
			}
			
			System.out.println("SuperPom");
			String parent = "superPom";
			
			for (int i = 0; i < dependencies.size(); i++) {
			    final Dependency dependency = dependencies.get(i);
			    		 //System.out.println("Writing Results");
					    //System.out.print(modDate);
					    //System.out.print(m.getGroupId()+","+m.getArtifactId()+","+m.getVersion()+",");
					    //System.out.println(dependency.getGroupId() + " , " + dependency.getArtifactId() + " , "
					        //+ dependency.getVersion() + " , " + dependency.getScope());
					    
			    	//write to file
			    	pomContents.append (dependency.getArtifactId() + " , "
			    		+ dependency.getVersion() +","+modDate+","
				        + parent+","
				        + m.getGroupId()+","+m.getArtifactId()+","+m.getVersion()+","
				        + dependency.getGroupId() + " , " + " , " + dependency.getScope()+" , "+fp);
			    		pomContents.append("\n");
			    	
			}
			String pContents = pomContents.toString();
			return pContents;
		}
		
	//Print the dependencies
	@SuppressWarnings("unchecked")
	public String printDep(Model m, String fp, String art, String artID){
		//ReadWriter wr = new ReadWriter();
		StringBuilder pomContents = new StringBuilder();
		final List<Dependency> dependencies = m.getDependencies();
		
		//update counters
		if (dependencies.size() == 0){
			skip++;
		}else{
			anaPOM++;
		}
		
		System.out.println("SuperPom");
		String parent = "superPom";
		
		for (int i = 0; i < dependencies.size(); i++) {
		    final Dependency dependency = dependencies.get(i);
		    
		    if (art.equalsIgnoreCase(dependency.getArtifactId())){
		    	if (artID.equalsIgnoreCase(dependency.getVersion())){
		    		 //System.out.println("Writing Results");
				    //System.out.print(modDate);
				    //System.out.print(m.getGroupId()+","+m.getArtifactId()+","+m.getVersion()+",");
				    //System.out.println(dependency.getGroupId() + " , " + dependency.getArtifactId() + " , "
				        //+ dependency.getVersion() + " , " + dependency.getScope());
				    
				    //write to file
				    pomContents.append (dependency.getArtifactId() + " , "
				    		+ dependency.getVersion() +","+modDate+","
					        + parent+","
				    + m.getGroupId()+","+m.getArtifactId()+","+m.getVersion()+","
				    + dependency.getGroupId() + " , " + " , " + dependency.getScope()+" , "+fp);
				    pomContents.append("\n");
		    	}
		    }
		}
		String pContents = pomContents.toString();
		return pContents;
	}
	
	public String printDepAll(Model m, String fp){
		//ReadWriter wr = new ReadWriter();
		StringBuilder pomContents = new StringBuilder();
		final List<Dependency> dependencies = m.getDependencies();
		
		//update counters
		if (dependencies.size() == 0){
			skip++;
		}else{
			anaPOM++;
		}
		
		//if this has a parent
		String parent = "null";
		
		if(m.getParent()!=null){
			parent = m.getParent().getArtifactId();
		}else{
			System.out.println("No parents");
		}
		
		for (int i = 0; i < dependencies.size(); i++) {
		    final Dependency dependency = dependencies.get(i);
		    
		    		 //System.out.println("Writing Results");
				    //System.out.print(modDate);
				    //System.out.print(m.getGroupId()+","+m.getArtifactId()+","+m.getVersion()+",");
				    //System.out.println(dependency.getGroupId() + " , " + dependency.getArtifactId() + " , "
				      //  + dependency.getVersion() + " , " + dependency.getScope());
				    
				    //write to file
				    pomContents.append (dependency.getArtifactId() + ","
					        + dependency.getVersion() +","+modDate+","
					        + parent+","
				    + m.getGroupId()+","+m.getArtifactId()+","+m.getVersion()+","
				    + dependency.getGroupId() +" , " + dependency.getScope()+" , "+fp);
				    pomContents.append("\n");
		    	
		}
		String pContents = pomContents.toString();
		return pContents;
	}
	
	//public static void main(String[] args) {
        //PomParser fw = new PomParser();
        //fw.walkParse();
    //}

}
