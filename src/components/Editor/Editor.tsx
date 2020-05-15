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
    console.log("isBlockElementFunct input -> ", text)
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
            if (text == equiv_subheading_text && equiv_subheading_text.length > 0) {
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

function getCaretCharacterOffsetWithin(element: HTMLElement | null) {
    var caretOffset = 0;
    var doc: Document | null = element.ownerDocument || element.document;
    var win: Window = doc?.defaultView || doc?.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
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

function moveCaretTo(el: HTMLElement | null, new_pos: number) {
    // Place the caret at new_pos
    const target = document.createTextNode('');

    el.appendChild(target);
    // do not move caret if element was not focused
    const isTargetFocused = document.activeElement === el;
    if (target !== null && target.nodeValue !== null && isTargetFocused) {
        var sel = window.getSelection();
        if (sel !== null) {
            if (sel.rangeCount > 0) {
                var textNode = sel.focusNode;
                var newOffset = sel.focusOffset + new_pos;
                sel.collapse(textNode, Math.min(String(textNode?.textContent).length, newOffset));
            }
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
    caret_pos: number,
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
            caret_pos: 0,
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
        //this.focus();
        //this.cursorToEnd();
    }

    componentWillReceiveProps() {
        var new_caret_pos: number = getCaretCharacterOffsetWithin(this.inputRegionReftest.current);
        console.log("CARET POS", new_caret_pos);
        if (this.state.caret_pos != new_caret_pos) {
            this.setState({
                caret_pos: new_caret_pos
            })
        }

    }
    componentDidUpdate(oldProps: InputRegionProps) {
        //console.log("Input region UPDATE old(", oldProps, ") new(", this.props, ")")
        // Focus gets lost when tag style changes causing a rerender, so we need to explicitly
        // Set focus when this happens and move the cursor to the end
        if (oldProps.input_region_tag_style != this.props.input_region_tag_style) {

            // Issues here, need to account for when block elmenet id is modified and text is in
            // input region
            //this.cursorToEnd();
            var new_caret_pos: number = getCaretCharacterOffsetWithin(this.inputRegionReftest.current);
            this.focus();
            moveCaretTo(this.inputRegionReftest.current, this.state.caret_pos);
        }
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
    input_region_text: string,
    input_region_html: string,
    // Depends on value of block_element_id (e.g. if block_element_id is '#' then input_tag_style will be 'h1' - Header 1)
    // ^^ Based on markdown syntax
    input_block_id_tag_style: string,
    input_region_tag_style: string,
};
export default class LarkInputLine extends React.Component<LarkInputLineProps, LarkInputLineState> {
    blockElementIDRef: React.RefObject<BlockElementID>;
    inputRegionRef: React.RefObject<InputRegion>;
    constructor(props: LarkInputLineProps) {
        super(props);
        // Initialize react references (needed to set focus for components)
        this.blockElementIDRef = React.createRef();
        this.inputRegionRef = React.createRef();

        this.state = {
            block_element_id_visible: true,
            input_region_visible: false,
            is_block_element: false,
            block_element_id: "",
            input_region_text: "",
            input_region_html: "",
            input_block_id_tag_style: "",
            input_region_tag_style: "",
        }
    }

    onBlockElIDRevealerClicked = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        /*         if (this.state.block_element_id_visible == false) {
                    this.setState({ block_element_id_visible: true })
                } */
    }


    handleBlockElementIDChange = (event: ContentEditableEvent) => {
    }

    handleBlockElementIDKeyPresses = (event: React.KeyboardEvent<HTMLElement>) => {
    }

    handleInputRegionFocus = (event: React.FocusEvent<HTMLDivElement>) => {
        // We don't want the block element id component to be visible whenever input 
        // region has focus
    }

    hasBlockElementIdentifier = (text: string) => {
        // Index position of ' ' character
        var space_index: number = 0;
        console.log("HAS BLOCK EL TEXT|", text, "|");
        // Checks to see if text has a block element identifier at the beginning

        for (let idx = 0; idx < text.length; idx++) {
            console.log("HAS BLK ID -> |", text[idx], "| idx(", idx, ")");
            // This less straightforward way of checking for whitespace is needed because
            // using text[idx] == " ", does not work in all cases. Possibly due to variability in whitespace because 
            // its a user input field.
            // Approach to check if current char is a space " " :
            // If current character is " " trim function will return "" (stripped whitespace version)
            // length of "" is 0
            if (text[idx].trim().length == 0) {
                console.log("SPACEEEE", text[idx].trim());
                space_index = idx;
                break;
            }
        }

        // At the moment we don't know for sure if text before first space is a block element identifier
        // Hence we're labelling it as potential
        var potential_block_element_id: string = text.substring(0, space_index);
        if (space_index == 0) {
            // There are no spaces in text, so all of it could potentially be a block element
            // identifier
            potential_block_element_id = text;
        }
        console.log("Has block element space index->", space_index);
        console.log("Has block element blk id->", text.substring(0, space_index));
        // We want to check if all the characters upto the first occurence of ' ' 
        // is a block element identifier
        return isBlockElement(potential_block_element_id);
    }

    handleInputRegionChange = (event: ContentEditableEvent) => {
        var curr_text: string = event.currentTarget.textContent;
        // If the text in our input region hasn't changed we don't need to do anything
        // the onChange event was probably called because of extraneous reasons like pressing shift etc.
        if (this.state.block_element_id + this.state.input_region_text != curr_text) {
            console.log("Curr text |", curr_text, "|");
            this.hasBlockElementIdentifier(curr_text);

            var [text_is_block, new_block_element_id, new_input_region_tag_style] = this.hasBlockElementIdentifier(curr_text);
            var input_region_raw_text: string = curr_text.substr(new_block_element_id.length, curr_text.length);
            var new_input_region_html: string = "";
            // Text in input region has a block element identifier
            if (text_is_block == true) {
                new_input_region_html = "<span class='blockElementId'>" + new_block_element_id + "</span>" + input_region_raw_text;
            } else {
                new_input_region_html = curr_text
            }

            this.setState({
                is_block_element: text_is_block,
                block_element_id: new_block_element_id,
                input_region_text: input_region_raw_text,
                input_region_html: new_input_region_html,
                input_region_tag_style: new_input_region_tag_style,
            })
        }
        /*         if (curr_text.length > 0) {
                    var [text_is_block, new_block_element_id, new_input_region_tag_style] = hasBlockElementIdentifier(curr_text);
                    console.log("Curr Text (", curr_text, ") has block id ", text_is_block);
                    var input_region_raw_text: string = curr_text.substr(this.state.block_element_id.length, curr_text.length);
                    var new_input_region_html: string = "";
                    // Text in input region has a block element identifier
                    if (text_is_block == true) {
                        new_input_region_html = "<span class='blockElementId'>" + new_block_element_id + "</span>";
                    } else {
                        new_input_region_html = curr_text
                    }
        
                    this.setState({
                        is_block_element: text_is_block,
                        block_element_id: new_block_element_id,
                        input_region_html: new_input_region_html,
                        input_region_tag_style: new_input_region_tag_style,
                    })
        
                }
         */


        /* 
        var input_region_raw_text: string = curr_text.substr(this.state.block_element_id.length, curr_text.length);
        var new_input_region_html: string = "";
        // Text in input region has a block element identifier
        if (text_is_block == true) {
            new_input_region_html = "<span class='blockElementId'>" + new_block_element_id + "</span>";
        } else {
            new_input_region_html = curr_text
        }
     
        this.setState({
            is_block_element: text_is_block,
            block_element_id: new_block_element_id,
            input_region_html: new_input_region_html,
            input_region_tag_style: new_input_region_tag_style,
        })
     
    } else {
        // Input region text without block id and no html tags
        var input_region_raw_text: string = curr_text.substr(this.state.block_element_id.length, curr_text.length);
        var new_input_region_html: string = curr_text;
        // If the text in the input region has a block element identifier at the beginning
        // then we'll wrap the identifier with a span element (so the identifier can be styled with css)
        if (this.state.is_block_element == true)
            new_input_region_html = "<span class='blockElementId'>" + this.state.block_element_id + "</span>" + input_region_raw_text;
     
        this.setState({
            input_region_text: input_region_raw_text,
            input_region_html: new_input_region_html,
        })
    }
    testdebug++;
    } */
        /*         else {
                    this.setState({
                        is_block_element: false,
                        block_element_id: "",
                        input_region_html: "",
                        input_region_tag_style: "",
                        input_region_text: "",
                    })
                } */
        //this.setState({ input_region_html: "<span class='blockElementId'>Test</span>" });
    }

    handleInputRegionKeyPresses = (event: React.KeyboardEvent<HTMLDivElement>) => { }

    render() {
        return (
            <Grid container direction="row" spacing={0} alignItems="center">
                <Grid item>
                    {/* Workaround to have an empty button */}
                    <Box onClick={this.onBlockElIDRevealerClicked} p={1}><h1></h1></Box>
                </Grid>
                <Grid item>
                    <InputRegion
                        ref={this.inputRegionRef}
                        html={this.state.input_region_html}
                        input_region_tag_style={this.state.input_region_tag_style}
                        handleChange={this.handleInputRegionChange}
                        handleKeyPresses={this.handleInputRegionKeyPresses}
                        handleFocus={this.handleInputRegionFocus} />

                </Grid>
            </Grid >
        );
    }
};

type LarkEditorProps = {};
type LarkEditorState = {};
class LarkEditor extends React.Component<LarkEditorProps, LarkEditorState> { };
