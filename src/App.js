import React, { PureComponent } from "react";
import FeaturedList from './featuredlist'
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";

class App extends PureComponent {
    render() {
        return (
            <MuiThemeProvider>
                <FeaturedList />
            </MuiThemeProvider>
        )
    }
}

export default App
//<Route path="/about" component={About} />
