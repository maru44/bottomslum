import React from 'react';
import { BrowserRouter as Router,Link, Route, withRouter } from 'react-router-dom';
import Res from './Res';
import Post from './Apost';

class Detail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: null,
            reloading: false,
            replyFor: null,
            num: null,
        }
        this.addPost = this.addPost.bind(this);
        this.Loading = this.Loading.bind(this);
        this.handleToNext = this.handleToNext.bind(this);
        this.niceVisual = this.niceVisual.bind(this);
    }

    componentDidMount() {
        this.setState({ loading: true }, () => {
            this.Loading();
        })
    }

    niceVisual = () => {
        $(".yetVisual").each(() => {
          $(this).html($(this).html().replace(/((https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,"<a target='_new' href='$1'>$1</a>"));
        });
        $(".yetVisual a").each(() => {
          $(this).html($(this).html().replace(/((https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|](\.png|\.jpg|\.gif)+)/ig, "<img class='pointer' src='$1'>"));
        });
        $(".yetVisual").removeClass("yetVisual");
        $(".postedDate").each(() => {
            //$(this).html($(this).html().replace(/(\+\d{2}:\d{2})+/g, ""));
            const dateStr = new String($(this).html())
            const dateDate = new Date(dateStr).toLocaleString({ timeZone: timezone });
            $(this).html(dateDate);
        });
    }

    Loading = () => {
        const pathn = location.pathname;
        const pk_ = pathn.replace("/detail/", "");
        fetch('/graphql', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
		    query: `query { allPosts(board_Id: "${pk_}" orderBy: "-posted") { edges { node { pk content number posted par { pk number content posted anon { aid } } parent { edges { node { content pk number posted anon { aid } } } } board { title created updated canWrite wall { name slugName } prevBoard { pk } nextBoard { pk } } anon { aid } } } } }`,
            }),
        })
        .then(response => {
            return response.json()
        })
        .then(datas => {
            this.setState({ reloading: false, data: datas.data, loading: false, replyFor: null, num: null });
            this.niceVisual();
        })
        .catch( err => {
            console.log(err);
        })
    }

    componentDidUpdate() {
        if (this.state.reloading == true ) {
            this.Loading();
        }
    }

    addPost = (e) => {
        var conte = e.target.parentNode.querySelector('textarea');
        const content_ = conte.value.replace(/<(".*?"|'.*?'|[^'"])*?>/g, "").replace(/\r?\n/g, "<br/>");
        const pathn = location.pathname;
        const pk_ = pathn.replace("/detail/", "");
        conte.value = '';
        if (this.state.replyFor && this.state.num) {
            if (!content_ || content_.length > 400) {console.log(`${content_}`)}
            else {
                fetch('/graphql', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'X-CSRFToken': csrftoken,
                    },
                    body: JSON.stringify({
                        query: `mutation { createRep(boardPk: "${pk_}" content: "${content_}" parPk: "${this.state.replyFor}") { content number board { title pk } anon { aid } } }`,
                    }),
                })
                .then(response => {
                    return response.json()
                })
                .then(() => {
                    $(".modal").addClass("off");
                    $(".modal-con").addClass("off");
                    this.setState({ reloading: true, replyFor: null, num: null });
                })
                .catch( err => {
                    console.log(err);
                })
            }
        } else {
            if (!content_ || content_.length > 400) {console.log(`${content_}`)}
            else {
                fetch('/graphql', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'X-CSRFToken': csrftoken,
                    },
                    body: JSON.stringify({
                        query: `mutation { createPost(boardPk: "${pk_}" content: "${content_}") { content number board { title pk } anon { aid } } }`,
                    }),
                })
                .then(response => {
                    return response.json()
                })
                .then(() => {
                    $(".modal").addClass("off");
                    $(".modal-con").addClass("off");
                    this.setState({ reloading: true, replyFor: null, num: null });
                })
                .catch( err => {
                    console.log(err);
                })
            }
        }
    }

    handleToNext = (props) => {
        this.props.history.push(`/detail/${props.bpk}`)
    }

    render(){
        if (!this.state.data || this.state.loading) {
            return(
                <div>
                    <h1 className="textCen">Loading ...</h1>
                </div>
            )
        }
        let prev_ = this.state.data.allPosts.edges[0].node.board.prevBoard;
        let next_ = this.state.data.allPosts.edges[0].node.board.nextBoard;
        document.title = `${this.state.data.allPosts.edges[0].node.board.title}`;
        return(
            <div className="center90">
                <div className="mt15 mb15 textCen brAll">
                  <h3 className="hrefBox">
                    { this.state.data.allPosts.edges[0].node.board.wall.name } 一覧に戻る
                    <Link to={`/wall/${this.state.data.allPosts.edges[0].node.board.wall.slugName }`} className="hrefBoxIn" />
                  </h3>
                </div>
                <h1 className="brAll pageTitle">{this.state.data.allPosts.edges[0].node.board.title}</h1>
                {this.state.data.allPosts.edges.map(value => (
                    <Post number={value.node.number} par={value.node.par} anon={value.node.anon} posted={value.node.posted} pk={value.node.pk} parent={value.node.parent} content={value.node.content} canResp></Post>
                ))}
                <div className="mt30 flexNormal w100">
                    <div className="w30">
                      {prev_ && <div className="btnBrown flexCen hrefBox w100"><Link to={`/detail/${prev_.pk}`} className="hrefBoxIn"></Link>前</div>}
                    </div>
                    <div onClick={() => this.setState({reloading: true})} className="w30 btnBrown flexCen mra mla pointer">新着</div>
                    <div className="w30">
                      {next_ && <div className="btnBrown flexCen hrefBox w100"><Link to={`/detail/${next_.pk}`} className="hrefBoxIn"></Link>次</div>}
                    </div>
                </div>
                {this.state.data.allPosts.edges[0].node.board.canWrite &&
                  <div>
                    <div className="mt30">
                      <div className="w70 mla mra">
                        <div>
                          <label><b>書き込み内容</b></label><br />
                          <textarea rows="5" maxlength="400"/>
                          <button onClick={this.addPost} className="pointer buttonA">送信</button>
                        </div>
                      </div>
                    </div>
                    <div className="off modal" onClick={() => this.setState({ replyFor: null, num: null })}></div>
                    <div className="off modal-con">
                      <div className="w70 mla mra">
                        <div>
                          <label><b>書き込み内容</b>{this.state.replyFor && <span className="ml30">{this.state.num}への返信</span>}</label><br />
                          <textarea id="content" rows="5" maxlength="400"/>
                          <button onClick={this.addPost} className="pointer buttonA">送信</button>
                        </div>
                      </div>
                    </div>
                  </div>
                }
            </div>
        )
    }
}

export default Detail;
