
import * as shell from "shelljs";

// Copy all the view templates
// shell.mkdir("build/views");
shell.cp( "-R", "src/views", "build/views" );
