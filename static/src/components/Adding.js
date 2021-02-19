import React from 'react';

class Adding extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="w70 mla mra">
              {this.props.isBoard && 
                <div>
                  <label for="id_title"><b>新規タイトル</b></label><br />
                  <input type="text" maxlength="36" placeholder="タイトル" />
                  <label className="mt3" for="id_content"><b>書き込み内容</b></label><br />
                  <textarea rows="5" maxlength="1000"/>
                  <button onClick={this.props.func} className="pointer buttonA modalB">作成</button>
                </div>
              }
            </div>
        )
    }
}

export default Adding;