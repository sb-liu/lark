import React from 'react';
import LarkContentEditable, { ContentEditableEvent } from '../Containers/LarkContentEditable'
import "./styles.css"

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


export default class BlockElementID extends React.Component<BlockElementIDProps, BlockElementIDState> {
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
      return <LarkContentEditable
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