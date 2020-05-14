import React from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import "./styles.css"

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
        block_element_html_tag_style = "";
        // Check if input_text could be a subheader e.g. "##" or "###" etc
        // Note: only headers up to h6 are supported in html
        if (text.length <= 6) {
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
    // Variable
    block_element_id: string,
    input_block_tag_style: string,
    // Callback functions
    handleChange: (event: ContentEditableEvent) => void;
    handleKeyPresses: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

type BlockElementIDState = {
    html: string,
    should_focus: boolean,
}

function replaceCaret(el: HTMLElement | null) {
    // Place the caret at the end of the element
    const target = document.createTextNode('');

    el.appendChild(target);
    // do not move caret if element was not focused
    const isTargetFocused = document.activeElement === el;
    if (target !== null && target.nodeValue !== null && isTargetFocused) {
        var sel = window.getSelection();
        if (sel !== null) {
            var range = document.createRange();
            range.setStart(target, target.nodeValue.length);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        if (el instanceof HTMLElement) el.focus();
    }
}

class BlockElementID extends React.Component<BlockElementIDProps, BlockElementIDState> {
    blockElementIDRef: React.RefObject<HTMLElement>;

    constructor(props: BlockElementIDProps) {
        super(props)
        this.blockElementIDRef = React.createRef();
        this.state = {
            // html: "<b>Hello <i>World</i></b>" 
            html: this.props.block_element_id,
            // by default focus is set to block element id component first
            should_focus: true,
        };
    };

    focusHandler = (event: React.FocusEvent<HTMLDivElement>) => {


    }

    focus = () => {
        // Helper function to set focus
        if (this.state.should_focus == true)
            this.blockElementIDRef.current?.focus();
    }

    allowFocus = () => {
        this.setState({
            should_focus: true,
        })
    }

    preventFocus = () => {
        this.setState({
            should_focus: false,
        })
    }
    /*     handleChange = (event: ContentEditableEvent) => {
            this.setState({ html: event.target.value });
        }; */



    componentDidUpdate(oldProps: BlockElementIDProps) {
        console.log("old block id (", oldProps.input_block_tag_style, ") curr id -> (", this.props.input_block_tag_style, ")");

        // We only need to explicitly reset focus on style change
        if (oldProps.input_block_tag_style != this.props.input_block_tag_style) {
            // The style of the block element id container has been changed
            // Focus often gets lost when style changes and a re-render is issued
            // Explicitly set focus after style change
            this.focus();
            // When focus is set after re-render, cursor position is at the beginning
            // We want our cursor to be at the end of the block element id component
            replaceCaret(this.blockElementIDRef.current);
        }

    }
    render = () => {
        return <ContentEditable
            onFocus={this.focusHandler}
            innerRef={this.blockElementIDRef}
            html={this.props.block_element_id} // innerHTML of the editable div
            disabled={false}       // use true to disable editing
            onChange={this.props.handleChange} // handle innerHTML change
            onKeyDown={this.props.handleKeyPresses} // handle key presses
            tagName={this.props.input_block_tag_style} // Use a custom HTML tag (uses a div by default)
            placeholder="Type Something" // place holder text
        />
    };
};

type InputRegionProps = {
    // Variables
    html: string;
    input_region_tag_style: string;
    // Callback functions
    handleChange: (event: ContentEditableEvent) => void;
    handleKeyPresses: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    handleFocus: (event: React.FocusEvent<HTMLDivElement>) => void;
}

type InputRegionState = {
    html: string,
    should_focus: boolean,
}

class InputRegion extends React.Component<InputRegionProps, InputRegionState> {
    inputRegionReftest: React.RefObject<HTMLElement>;

    constructor(props: InputRegionProps) {
        super(props)
        this.inputRegionReftest = React.createRef();
        this.state = {
            html: "",
            // By default on program load input region doesn't have focus
            should_focus: true,
        };
    };

    focus = () => {
        // Helper function to set focus
        console.log("Input region focus Function call")
        if (this.state.should_focus == true)
            this.inputRegionReftest.current?.focus();
    }

    cursorToEnd = () => {
        replaceCaret(this.inputRegionReftest.current);
    }

    allowFocus = () => {
        this.setState({
            should_focus: true,
        })
    }

    preventFocus = () => {
        this.setState({
            should_focus: false,
        })
    }

    componentDidMount() {
        // Set focus on render
        console.log("CURSOR UPDATER")
        this.focus();
        this.cursorToEnd();
    }

    componentDidUpdate() {


    }

    render() {
        return (
            <ContentEditable
                innerRef={this.inputRegionReftest}
                html={this.props.html} // innerHTML of the editable div
                disabled={false}       // use true to disable editing
                onChange={this.props.handleChange} // handle innerHTML change
                onKeyDown={this.props.handleKeyPresses} // handle Key Presses
                tagName={this.props.input_region_tag_style} // Use a custom HTML tag (uses a div by default)
                placeholder="type something"
                onFocus={this.props.handleFocus}

            />
        );

    };
};

var testdebug = 1;
type LarkInputLineProps = {};
type LarkInputLineState = {
    // Variables
    block_element_id_visible: boolean,
    input_region_visible: boolean,
    is_block_element: boolean,
    block_element_id: string,
    input_region_html: string,
    // Depends on value of block_element_id (e.g. if block_element_id is '#' then input_tag_style will be 'h1' - Header 1)
    // ^^ Based on markdown syntax
    input_block_id_tag_style: string,
    input_region_tag_style: string,
};
export default class LarkInputLine extends React.Component<LarkInputLineProps, LarkInputLineState> {
    blockElementIDRef: React.RefObject<BlockElementID>;
    inputRegionRef: React.RefObject<InputRegion>;
    nameRef: any;
    constructor(props: LarkInputLineProps) {
        super(props);
        // Initialize react references (needed to set focus for components)
        this.blockElementIDRef = React.createRef();
        this.inputRegionRef = React.createRef();
        this.nameRef = React.createRef();

        this.state = {
            block_element_id_visible: true,
            input_region_visible: false,
            is_block_element: false,
            block_element_id: "",
            input_region_html: "",
            input_block_id_tag_style: "",
            input_region_tag_style: "",
        }
    }

    onBlockElIDRevealerClicked = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (this.state.block_element_id_visible == false) {
            this.setState({ block_element_id_visible: true })
        }
    }


    handleBlockElementIDChange = (event: ContentEditableEvent) => {
        console.log("On block element id change", testdebug, event.currentTarget.textContent);
        // either event.target.value or event.currentTarget.textContent works
        // curr_text_blk_element_id is the text currently present in block element id component (this is user typed)
        var curr_text_blk_element_id: string = event.currentTarget.textContent;
        // If text in block element id component is not empty i.e. not equal ''
        if (curr_text_blk_element_id.length > 0) {
            // isBlockElement returns a tuple with 3 variables
            // First variable is a boolean which is true if the user typed a valid block element id e.g. "#" in the block element id component
            // Second variable is just the text of the block element (not needed anymore will probably be deprecated)
            // Third variable is the appropriate tag style that corresponds to the valid block element id e.g. "#" would have a tag style of h1 (header 1)
            var [newblk_id_is_block, new_block_element_id, new_block_tag_style] = isBlockElement(curr_text_blk_element_id);
            this.setState({
                is_block_element: newblk_id_is_block,
                block_element_id: curr_text_blk_element_id,
                input_block_id_tag_style: new_block_tag_style,
                input_region_tag_style: new_block_tag_style,
            });
            // We need to handle the case when the user just starts typing text (not block elements) into the block element id component
            // All valid block element ids have max length 7

            // Need to handle the case where there is already text in the input region,
            // and user types more plain text into block element id
            if (newblk_id_is_block == false && curr_text_blk_element_id.length >= 7) {
                console.log("I was afraid of this");
                this.setState({
                    is_block_element: false,
                    //block_element_id_visible: false,
                    input_region_visible: true,
                    block_element_id: "",
                    input_block_id_tag_style: "",
                    input_region_html: curr_text_blk_element_id,
                    input_region_tag_style: "",
                })
                this.inputRegionRef.current?.focus();
                this.inputRegionRef.current?.cursorToEnd();
            }
            testdebug++;
        } else {
            testdebug = 1;
            console.log("Clear text")
            // text in block element id component is empty ""
            this.setState({
                is_block_element: false,
                block_element_id: "",
                input_block_id_tag_style: "",
                input_region_tag_style: "",
            })
        }
    }

    handleBlockElementIDKeyPresses = (event: React.KeyboardEvent<HTMLElement>) => {
        console.log("On block element id Key event", event.currentTarget.textContent);
        // If space bar is pressed and text in block element id component is a supported block element typ

        if (event.keyCode == 32 && this.state.is_block_element) {
            console.log("Space in block element id pressed");
            // Prevent default action of appending ' ' on space
            ///event.preventDefault();
            this.setState({
                block_element_id_visible: false,
                input_region_visible: true
            })
            this.inputRegionRef.current?.focus();
        }


    }

    handleInputRegionFocus = (event: React.FocusEvent<HTMLDivElement>) => {
        // We don't want the block element id component to be visible whenever input 
        // region has focus
        this.setState({
            block_element_id_visible: false,
        })
    }

    handleInputRegionChange = (event: ContentEditableEvent) => {
        console.log("On input region changed");
        this.setState({ input_region_html: event.target.value });
    }

    handleInputRegionKeyPresses = (event: React.KeyboardEvent<HTMLDivElement>) => { }

    render() {
        return (
            <Grid container direction="row" spacing={0} alignItems="center">
                <Grid item>
                    {/* Workaround to have an empty button */}
                    <Box onClick={this.onBlockElIDRevealerClicked} p={1}><h1></h1></Box>
                </Grid>
                <Grid item >
                    {this.state.block_element_id_visible ?
                        <BlockElementID
                            ref={this.blockElementIDRef}
                            block_element_id={this.state.block_element_id}
                            input_block_tag_style={this.state.input_block_id_tag_style}
                            handleChange={this.handleBlockElementIDChange}
                            handleKeyPresses={this.handleBlockElementIDKeyPresses} />
                        : null}
                </Grid>
                <Grid item>
                    {this.state.input_region_visible ?
                        <InputRegion
                            ref={this.inputRegionRef}
                            html={this.state.input_region_html}
                            input_region_tag_style={this.state.input_region_tag_style}
                            handleChange={this.handleInputRegionChange}
                            handleKeyPresses={this.handleInputRegionKeyPresses}
                            handleFocus={this.handleInputRegionFocus} />
                        : null}
                </Grid>
            </Grid >
        );
    }
};

type LarkEditorProps = {};
type LarkEditorState = {};
class LarkEditor extends React.Component<LarkEditorProps, LarkEditorState> { };
