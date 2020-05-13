import React from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
//import Page from "./components/Page";
import LarkInputLine from "./components/Editor/Editor";

function App() {
    return (
        <div>

            {/*             <Button variant="contained" color="primary">
                Hello World
        </Button> */}
            <LarkInputLine />
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
//ReactDOM.render(<App />, document.querySelector('#app'));