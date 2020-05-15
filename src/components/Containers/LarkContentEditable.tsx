import ContentEditable from 'react-contenteditable'


export type ContentEditableEvent = React.SyntheticEvent<any, Event> & { target: { value: string } };

export default class LarkContentEditable extends ContentEditable {
    componentDidUpdate() {
        const el = this.getEl();
        if (!el) return;

        // Perhaps React (whose VDOM gets outdated because we often prevent
        // rerendering) did not update the DOM. So we update it manually now.
        if (this.props.html !== el.innerHTML) {
            el.innerHTML = this.props.html;
        }
        this.lastHtml = this.props.html;
        //replaceCaret(el);
    }
}