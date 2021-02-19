import React from 'react';
import { BrowserRouter as Router,Link, Route, withRouter } from 'react-router-dom';
import Res from './Res';

class Post extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <div className="mt10 mb5 w100 everyPost" id={`post_${this.props.number}`}>
              <p className="brAll postInfo">
                {this.props.par && <span className="mr10 gleenLetter parPost">
                  <b className="hrefBox">&#9668;{this.props.par.number}<a href={`#post_${this.props.par.number}`} className="hrefBoxIn"/></b>
                  <Res num={this.props.par.number} content={this.props.par.content} anon={this.props.par.anon.aid} date={this.props.par.posted} /></span>
                }
                {this.props.number}<span className="ml10"><b className="hrefBox">{this.props.anon.aid}<Link to={`/anonymous/${this.props.anon.aid}`} className="hrefBoxIn" /></b></span>
                <span className="ml10 postedDate">{this.props.posted}</span>
                {this.props.canResp &&
                  <span onClick={() => this.setState({ replyFor: this.props.pk, num: this.props.number }) } className="ml10 pointer gleenLetter repB mr15">返信する</span>
                }
                {this.props.parent && this.props.parent.edges.map(childvalue => (
                    <span className="gleenLetter ml5 parPost">
                    <b className="hrefBox">{childvalue.node.number}<a href={`#post_${childvalue.node.number}`} className="hrefBoxIn"/></b>
                    <Res num={childvalue.node.number} content={childvalue.node.content} anon={childvalue.node.anon.aid} date={childvalue.node.posted} /></span>
                ))}
              </p>
              <p className="postCon brAll yetVisual" dangerouslySetInnerHTML={{__html: this.props.content}}></p>
            </div>
        )
    }
}

export default Post;