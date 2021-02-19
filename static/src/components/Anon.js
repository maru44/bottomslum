import React from 'react';
import { BrowserRouter as Router,Link, Route, withRouter } from 'react-router-dom';
import Res from './Res';

class Anon extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: null,
            reloading: false,
        }
        this.Loading = this.Loading.bind(this);
        this.handleToNext = this.handleToNext.bind(this);
        this.niceVisual = this.niceVisual.bind(this);
    }

    componentDidMount() {
        this.setState({ loading: true }, () => {
            this.Loading()
        })
    }

    niceVisual = () => {
        $(".yetVisual").each(function() {
          $(this).html($(this).html().replace(/((https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,"<a target='_new' href='$1'>$1</a>"));
        });
        $(".yetVisual a").each(function() {
          $(this).html($(this).html().replace(/((https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|](\.png|\.jpg|\.gif)+)/ig, "<img class='pointer' src='$1'>"));
        });
        $(".yetVisual").removeClass("yetVisual");
        $(".postedDate").each(function() {
            //$(this).html($(this).html().replace(/(\+\d{2}:\d{2})+/g, ""));
            const dateStr = new String($(this).html())
            const dateDate = new Date(dateStr).toLocaleString({ timeZone: timezone });
            $(this).html(dateDate);
        });
    }

    Loading = () => {
        const pathn = location.pathname;
        const pk_ = pathn.replace("/anonymous/", "");
        fetch('/graphql', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                query: `query { allPosts(anon_Aid: "${pk_}") { edges { node { pk content number posted anon { aid } par { pk number content posted anon { aid } } parent { edges { node { content pk number posted anon { aid } } } } board { pk title created updated canWrite wall { name slugName } prevBoard { pk } nextBoard { pk } } } } } }`,
            }),
        })
        .then(response => {
            return response.json()
        })
        .then(datas => {
            this.setState({ reloading: false, data: datas.data, loading: false });
            this.niceVisual();
        })
        .catch(function(error){
            console.log(error);
        })
    }

    componentDidUpdate() {
        if (this.state.reloading == true ) {
            this.Loading();
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
        document.title = `${this.state.data.allPosts.edges[0].node.anon.aid}`;
        return(
            <div className="center90">
                <h1 className="brAll pageTitle">{this.state.data.allPosts.edges[0].node.anon.aid}の投稿</h1>
                {this.state.data.allPosts.edges.map(value => (
                    <div className="mt10 mb5 w100 everyPost" id={`post_${value.node.number}`}>
                      <p className="brAll postInfo">
                        {value.node.par && <span className="mr10 gleenLetter parPost">
                          <b>&#9668;{value.node.par.number}</b>
                          <Res num={value.node.par.number} content={value.node.par.content} anon={value.node.par.anon.aid} date={value.node.par.posted} /></span>}
                        {value.node.number}<span className="ml10"><b className="hrefBox">{value.node.board.title} <Link to={`/detail/${value.node.board.pk}`} className="hrefBoxIn" /></b>
                        <b className="hrefBox">({value.node.board.wall.name})<Link className="hrefBoxIn" to={`/wall/${value.node.board.wall.slugName}`} /></b></span>
                        <span className="ml10 postedDate">{value.node.posted}</span>
                        {value.node.parent && value.node.parent.edges.map(childvalue => (
                            <span className="gleenLetter ml5 parPost">
                            <b>{childvalue.node.number}</b>
                            <Res num={childvalue.node.number} content={childvalue.node.content} anon={childvalue.node.anon.aid} date={childvalue.node.posted} /></span>
                        ))}
                      </p>
                      <p className="postCon brAll yetVisual" dangerouslySetInnerHTML={{__html: value.node.content}}></p>
                    </div>
                ))}
                <div className="mt30 flexNormal w100">
                    <div onClick={() => this.setState({reloading: true})} className="w30 btnBrown flexCen mra mla pointer">新着</div>
                </div>
            </div>
        )
    }
}

export default Anon;