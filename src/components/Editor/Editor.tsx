import React from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import Grid from '@material-ui/core/Grid';


// (input_variable: input_variable_type): return type
function isBlockElement(input_text: string | null): [boolean, string, string] {
    // Checks to see if text is a supported block element type

    var is_block_element: boolean = false
    // possible values of block_element_html_tag_style are 'h1', 'div'. etc
    var block_element_id: string = "";
    var block_element_html_tag_style: string = ""
    var text: string = "";

    if (typeof (input_text) != null)
        text = input_text;

    // Object literals equivalent to hash tables
    // Checks to see if text exists in object literals

    var supported_block_element_types: { [key: string]: string } = {
        "#": "h1",
    };


    block_element_html_tag_style = supported_block_element_types[text];
    //console.log("isBlockElementFunct input -> ", text)
    //console.log("Test 1", block_element_html_tag_style)

    // block_element_type will be undefined if our input text isn't present in supported_block_element_types
    if (block_element_html_tag_style === undefined) {
        block_element_html_tag_style = "div";
        // Check if input_text could be a subheader e.g. "##" or "###" etc
        var equiv_subheading_text: string = "#".repeat(text.length);
        //console.log("Test 2", equiv_subheading_text);

        // At this point is equiv_subheading_text is a string with the character '#' repeated based on 
        // the size of input_text (text = input_text at this point)
        if (text == equiv_subheading_text) {
            is_block_element = true;
            block_element_id = "#".repeat(text.length);
            block_element_html_tag_style = "h" + (text.length).toString();

            //console.log("Test 3", block_element_html_tag_style);
            //console.log("Test 4 ", (text.length).toString())
        }
    }
    else {
        is_block_element = true;
        // temporary hard code
        block_element_id = "#"
    }

    /*     if (text in supported_block_element_types) {
            is_block_element = true;
        } */

    // Return tuple 
    console.log("Block element ->", [is_block_element, block_element_html_tag_style]);
    return [is_block_element, block_element_id, block_element_html_tag_style];
}


type BlockElementIDProps = {
    block_element_id: string,
    input_block_tag_style: string,
    handleChange: (evt: ContentEditableEvent) => void;
}
type BLockElementIDState = {
    html: string,
}

class BlockElementID extends React.Component<BlockElementIDProps, BLockElementIDState> {
    blockElementIDRef: React.RefObject<HTMLElement>;
    constructor(props: BlockElementIDProps) {
        super(props)
        this.blockElementIDRef = React.createRef();
        this.state = {
            // html: "<b>Hello <i>World</i></b>" 
            html: this.props.block_element_id,
        };
    };

    /*     handleChange = (evt: ContentEditableEvent) => {
            this.setState({ html: evt.target.value });
        }; */

    // This function is used to update the state on prop change
    componentDidUpdate(nextProps: BlockElementIDProps) {
        if (nextProps.block_element_id != this.props.block_element_id) {
            this.setState({
                html: this.props.block_element_id,
            })
        }
    }
    render = () => {
        return <ContentEditable
            innerRef={this.blockElementIDRef}
            html={this.state.html} // innerHTML of the editable div
            disabled={false}       // use true to disable editing
            onChange={this.props.handleChange} // handle innerHTML change
            tagName={this.props.input_block_tag_style} // Use a custom HTML tag (uses a div by default)
        />
    };
};

type InputElementProps = {}
type InputElementState = {
    html: string,
    is_block_element: boolean,
    block_element_id: string,
    // Depends on value of block_element_id (e.g. if block_element_id is '#' then input_tag_style will be 'h1' - Header 1)
    // ^^ Based on markdown syntax
    input_tag_style: string,
}

class InputElement extends React.Component<InputElementProps, InputElementState> {
    inputElementRef: React.RefObject<HTMLElement>;
    constructor(props: InputElementProps) {
        super(props)
        this.inputElementRef = React.createRef();
        this.state = {
            html: "Hello World",
            is_block_element: false,
            block_element_id: "",
            input_tag_style: "div",
        };
    };

    handleBlockIDChange = (event: ContentEditableEvent) => {
        var block_id_cont_text: string = event.currentTarget.textContent;
        var [newblk_id_is_block, new_block_element_id, new_block_tag_style] = isBlockElement(block_id_cont_text);
        this.setState({
            is_block_element: newblk_id_is_block,
            block_element_id: new_block_element_id,
            input_tag_style: new_block_tag_style,
        })
    }

    handleChange = (event: ContentEditableEvent) => {
        this.setState({ html: event.target.value });
        console.log("Changed -> ", event.currentTarget.textContent);
    };

    handleKeyPresses = (event: React.KeyboardEvent<HTMLDivElement>) => {
        //console.log(event.currentTarget.textContent);

        // If spacebar is pressed
        if (event.keyCode == 32) {
            console.log("Space pressed");
            var curr_text = event.currentTarget.textContent;
            //var block_element: boolean = false
            //var block_element_type: string = ""

            var [block_element, input_block_element_id, block_element_tag_style] = isBlockElement(curr_text);
            //console.log("Is block elem", block_element);

            this.setState({
                is_block_element: block_element,
            })
            //this.state.is_block_element = block_element;
            // prevent default behaviour of ' ' being added
            if (block_element == true) {
                event.preventDefault();
                this.setState({
                    html: '',
                    // temporary hard code
                    block_element_id: input_block_element_id,
                    input_tag_style: block_element_tag_style,
                })
                this.inputElementRef.current?.focus();
            }
        }
    }

    componentDidUpdate(nextProps: InputElementProps) {
        // Set focus to the input element on state update
        this.inputElementRef.current?.focus();
    }

    render() {
        return (
            <Grid container spacing={1}>
                <Grid item direction="column">
                    <BlockElementID
                        block_element_id={this.state.block_element_id} // by default an input line is not a block element
                        handleChange={this.handleBlockIDChange}
                        input_block_tag_style={this.state.input_tag_style}
                    />
                </Grid>
                <Grid item direction="column">
                    <ContentEditable
                        innerRef={this.inputElementRef}
                        html={this.state.html} // innerHTML of the editable div
                        disabled={false}       // use true to disable editing
                        onChange={this.handleChange} // handle innerHTML change
                        onKeyDown={this.handleKeyPresses} // handle Key Presses
                        tagName={this.state.input_tag_style} // Use a custom HTML tag (uses a div by default)
                    />
                </Grid>
            </Grid>
        );

    };
};

type LarkInputLineProps = {};
type LarkInputLineState = {};
export default class LarkInputLine extends React.Component<LarkInputLineProps, LarkInputLineState> {
    constructor(props: LarkInputLineProps) {
        super(props);
    }

    render() {
        return (
            <Grid container>
                <Grid item>
                    <InputElement />
                </Grid>
            </Grid >
        );
    }
};

type LarkEditorProps = {};
type LarkEditorState = {};
class LarkEditor extends React.Component<LarkEditorProps, LarkEditorState> { };
