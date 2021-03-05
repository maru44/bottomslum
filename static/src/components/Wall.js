import React from 'react';
import { BrowserRouter as Router,Link, Route } from 'react-router-dom';
import Adding from './Adding';

class Wall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:false,
            data: null,
            reloading: false,
            searching: false,
            wallslug: null,
        }
        this.addData = this.addData.bind(this);
        this.Loading = this.Loading.bind(this);
        this.niceVisualHome = this.niceVisualHome.bind(this);
        this.Search = this.Search.bind(this);
    }
    
    componentDidMount() {
        this.setState({ loading: true }, () => {
            this.Loading();
        })
    }

    componentDidUpdate() {
        if (this.state.reloading == true ) {
            this.Loading();
            document.querySelectorAll("input").value = "";
            document.querySelectorAll("textarea").value = "";
            scrollTo(0, 0);
        } else if (this.state.searching == true ) {
            const sWord = document.getElementById("searchWord").value;
            location.search = `?search=${encodeURIComponent(sWord)}`;
            this.Loading();
        }
    }

    niceVisualHome = () => {
        $(".yetVisual").each(() => {
          $(this).html($(this).html().replace(/((https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|](\.png|\.jpg|\.gif)+)/ig, "<img src='$1'>"));
        });
        $(".yetVisual").removeClass("yetVisual");
        $(".postedDate").each(() => {
            const dateStr = new String($(this).html())
            const dateDate = new Date(dateStr).toLocaleString({ timeZone: timezone });
            $(this).html(dateDate);
        });
    }

    Loading = () => {
        const pathn = location.pathname;
        const wall_slug = pathn.replace("/wall/", "");
        const para = location.search;
        var titleIcon = "";
        if (para) {
        const searchW = para.replace("?search=", "");
        titleIcon = searchW;
        } else {}
        fetch('/graphql', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                query: `query { allBoards(title_Icontains: "${decodeURIComponent(titleIcon)}" wall_SlugName: "${wall_slug}" orderBy: "-updated") { edges { node { pk id title created updated count wall { name slugName } postSet(first: 5) { edges { node { content number posted anon { aid } } } } } } } }`,
            }),
        })
        .then(response => {
            return response.json()
        })
        .then(datas => {
            this.setState({ loading: false, data: datas.data, reloading: false, wallslug: wall_slug });
            this.niceVisualHome();
        })
        .catch(error => {
            console.log(error);
        })
    }

    Search = () => {
        const searchW = document.getElementById("searchWord").value;
        const pathn = location.pathname;
        const wall_slug = pathn.replace("/wall/", "");
        fetch('/graphql', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                query: `query { allBoards(title_Icontains: "${searchW}" wall_SlugName: "${wall_slug}" orderBy: "-updated") { edges { node { pk id title created updated count postSet(first: 5) { edges { node { content number posted anon { aid } } } } } } } }`,
            }),
        })
        .then(response => {
            return response.json()
        })
        .then(datas => {
            this.setState({ loading: false, data: datas.data, searching: false });
            this.niceVisualHome();
        })
        .catch(error => {
            console.log(error);
        })
    }

    addData = (e) => {
        var titl = e.target.parentNode.querySelector('input');
        var conte = e.target.parentNode.querySelector('textarea');
        const content_ = conte.value.replace(/<(".*?"|'.*?'|[^'"])*?>/g, "").replace(/\r?\n/g, "<br />");
        const title_ = titl.value;
        const pathn = location.pathname;
        const wall_slug = pathn.replace("/wall/", "");
        if (!title_ || !content_ || content_.length > 1000) { console.log(`${title_}, ${content_}`) }
        else {
            fetch('/graphql', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({
                    query: `mutation { createBoard(content: "${content_}" title: "${title_}" slugName: "${wall_slug}") { content number board { title pk } anon { aid } } }`,
                }),
            })
            .then(response => {
                return response.json()
            })
            .then(() => {
                titl.value = '';
                conte.value = '';
                $(".modal").addClass("off");
                $(".modal-con").addClass("off");
                this.setState({ reloading: true })
            })
            .catch(error => {
                console.log(error);
            })
        }
    }

    render(){
        if (!this.state.data || this.state.loading) {
            return(
                <div>
                    <h1 className="textCen">Loading ...</h1>
                    <div className="mt50">
                    <Adding func={this.addData}></Adding>
                  </div>
                  <div className="off modal"></div>
                  <div className="off modal-con">
                    <Adding func={this.addData}></Adding>
                  </div>
                </div>
            )
        }
        if (this.state.data.allBoards.edges[0]) {
            document.title = `${this.state.data.allBoards.edges[0].node.wall.name}`;
        }
        return(
            <div className="center90">
                <div className="mt15 mb15 textCen brAll">
                <h3>{ this.state.data.allBoards.edges[0] && this.state.data.allBoards.edges[0].node.wall.name }</h3>
                </div>
                <div className="mb15 flexNormal w90 mla mra">
                  <input type="text" id="searchWord" maxlength="36" className="flex1" placeholder="キーワード検索" />
                  <button onClick={() => this.setState({searching: true})} className="pointer buttonA">検索</button>
                </div>
                {this.state.data.allBoards.edges.map(value => (
                    <div key={value.node.pk} className="mt10 mb5 w100 hrefBox threadList">
                      <div className="flexNormal alCen">
                          <h2 className="noWhSpa ovHidd">{value.node.title}</h2>
                          <h2 className="boardCount mla">{value.node.count}</h2>
                      </div>
                      <div className="mt10">
                        {value.node.postSet.edges.map(value2 => (
                          <div className="mt5 mla mra w90">
                              <p className="ovHidd noWhSpa postInfo">{value2.node.number}<span className="ml10"><b>{value2.node.anon.aid}</b></span><span className="ml10 postedDate">{value2.node.posted}</span></p>
                              <p className="postCon brAll yetVisual" dangerouslySetInnerHTML={{__html: value2.node.content}}></p>
                          </div>
                        ))}
                      </div>
                      <Link to={`/detail/${value.node.pk}`} className="hrefBoxIn"/>
                    </div>
                ))}
                <div className="mt20 textCen">
                  <a onClick={() => this.setState({reloading: true})} className="pointer textCen borderB3">リロード</a>
                </div>
                <div className="mt50">
                  <Adding func={this.addData} isBoard={true}></Adding>
                </div>
                <div className="off modal"></div>
                <div className="off modal-con">
                  <Adding func={this.addData} isBoard={true}></Adding>
                </div>
            </div>
        )
    }
}

export default Wall;