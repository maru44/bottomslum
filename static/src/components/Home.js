import React from 'react';
import { BrowserRouter as Router,Link, Route } from 'react-router-dom';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:false,
            data: null,
            walldata: null,
            reloading: false,
            searching: false,
        }
        this.Loading = this.Loading.bind(this);
        this.niceVisualHome = this.niceVisualHome.bind(this);
        this.CatchWall = this.CatchWall.bind(this);
    }
    
    componentDidMount() {
        this.setState({ loading: true }, () => {
            this.CatchWall();
            this.Loading();
        })
    }

    CatchWall = () => {
        fetch('/graphql', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                query: `query { allWalls { edges { node { slugName name } } } }`,
            }),
        })
        .then(response => {
            return response.json()
        })
        .then(dataw => {
            this.setState({ walldata: dataw.data });
        })
        .catch(err => {
            console.log(err);
        })
    }

    componentDidUpdate() {
        if (this.state.reloading == true ) {
            this.Loading();
            scrollTo(0, 0);
        } else if (this.state.searching == true ) {
            const sWord = document.getElementById("searchWord").value;
            location.search = `?search=${encodeURIComponent(sWord)}`;
            this.Loading();
            $(".postBtn").addClass("visiHid");
        }
    }

    niceVisualHome = () => {
        $(".yetVisual").each(() => {
          $(this).html($(this).html().replace(/((https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|](\.png|\.jpg|\.gif)+)/ig, "<img src='$1'>"));
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
                query: `query { allBoards(title_Icontains: "${decodeURIComponent(titleIcon)}" orderBy: "-updated" first: 100) { edges { node { pk id title created updated count wall { name slugName } postSet(first: 1) { edges { node { content number posted anon { aid } } } } } } } }`
            }),
        })
        .then(response => {
            return response.json()
        })
        .then(datas => {
            this.setState({ loading: false, data: datas.data, reloading: false, searching: false });
            this.niceVisualHome();
        })
        .catch(err => {
            console.log(err);
        })
    }

    render(){
        if (!this.state.data || this.state.loading || !this.state.walldata) {
            return(
                <div>
                  <h1 className="textCen">Loading ...</h1>
                </div>
            )
        }
        document.title = `BottomSlum`;
        return(
            <div className="center90">
                <div className="mb15 flexNormal w90 mla mra">
                  <input type="text" id="searchWord" maxlength="36" className="flex1" placeholder="キーワード検索" />
                  <button onClick={() => this.setState({searching: true})} className="pointer buttonA">検索</button>
                </div>
                <div className="mt25 mb20">
                  <div className="w90 mla mra wallLists">
                  {this.state.walldata && this.state.walldata.allWalls.edges.map(value => (
                        <div key={value.node.slugName} className="hrefBox mr25">
                          {value.node.name}
                          <Link to={`/wall/${value.node.slugName}`} className="hrefBoxIn"/>
                        </div>
                    ))}
                  </div>
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
                        <div className="mla mra w90 textR gleenLetter">
                          <h4>{value.node.wall.name}</h4>
                        </div>
                      </div>
                      <Link to={`/detail/${value.node.pk}`} className="hrefBoxIn"/>
                    </div>
                ))}
                <div className="mt20 textCen">
                  <a onClick={() => this.setState({reloading: true})} className="pointer textCen borderB3">リロード</a>
                </div>
            </div>
        )
    }
}

export default Home;