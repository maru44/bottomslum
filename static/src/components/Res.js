import React from 'react';

class Res extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="parBox brAll blackLetter everyPost">
              <p className="brAll postInfo">
                {this.props.parnum && <span className="mr10 browLetter parPost"><b>&#9668;{this.props.parnum}</b></span>}
                {this.props.num}<span className="ml10"><b>{this.props.anon}</b></span>
                <span className="ml10 postedDate">{this.props.date}</span>
              </p>
              <p className="postCon brAll yetVisual" dangerouslySetInnerHTML={{__html: this.props.content}}></p>
            </div>
        )
    }
}

export default Res;