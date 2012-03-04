function NoteCell(html, name, url){
    this.html = html;
    this.name = name;
    this.url = url;
    this.child = new Array();
}
function NoteTree(){
    this.html;
    this.name;
    this.url;
    this.child = new Array();


    this.add = function(html,name,url){}

    this.addChild = function(html, name, url){
        this.child.push(new NoteCell(html, name, url));
    }

}
function PreNote(){
    this.note = new Array();
    this.tree = {};
    this.add = function(img_link_url, img_url, dst_url, dst_uname, src_url, src_uname){
        this.note.push({
            img_link_url : img_link_url,
            img_url      : img_url,
            dst_url      : dst_url,
            dst_uname    : dst_uname,
            src_url      : src_url,
            src_uname    : src_uname
        });
    }
        this.noteToTree = function(){
            
    }
}
pre_note = {
    img_link_url:"",
    img_url:"",
    dst_url:"",
    dst_uname:"",
    src_url:"",
    src_uname:""
};



var st;
$(function(){
    console.log("start");

    noteTree = new NoteTree();
    url = "http://strobot.tumblr.com/post/18123513647/kamatama-udon-cherrypin";

    /*$.get("/",{"q":url},function(res){
      console.log(res);
      });*/
    $("#notedata").append(html);
    prenote = new PreNote();
    $("#notedata li[class*=reblog]").css("background-color", "yellow")
    $("#notedata li[class*=reblog]").each(function(){
        //console.log(this);
        if(this.children[1].childElementCount == 1){    // foo posted this
            prenote.add(
                this.children[0].href,                  //img_link_url
                this.children[0].children[0].src,       //img_url
                this.children[1].children[0].href,      //dst_url
                this.children[1].children[0].innerText, //dst_usrname
                null,      //src_url
                null //src_usrname
                );
        } else {
            prenote.add(
                this.children[0].href,                  //img_link_url
                this.children[0].children[0].src,       //img_url
                this.children[1].children[0].href,      //dst_url
                this.children[1].children[0].innerText, //dst_usrname
                this.children[1].children[1].href,      //src_url
                this.children[1].children[1].innerText //src_usrname
                );
        }
    });

    st = new $jit.ST({
       injectInto: 'graph',
       width: 1700,
       height:800,
       constrained: false,
       levelsToShow: 50,
       levelDistance: 150,
       Node: {
           //height: 20,
           //width: 60,
           autoHeight: true,
       autoWidth:  true,
       type: 'rectangle',
       color:'#23A4FF',
       lineWidth: 2,
       align:"center",
       overridable: true
       },

       Navigation: {
           enable:true,
           panning:true
       },
       Edge: {
           type: 'bezier',
           lineWidth: 2,
           color:'#23A4FF',
           overridable: true
       },

       onBeforeCompute: function(node){
           console.log("loading " + node.name);
       },

       onAfterCompute: function(){
           console.log("done");
       },
       onCreateLabel: function(label, node){
           label.id = node.id; 
           label.innerHTML = node.name;
           //set label styles
           var style = label.style;
           //style.width = 60 + 'px';
           //style.height = 17 + 'px';            
           style.cursor = 'default';
           style.color = '#333';
           style.fontSize = '0.8em';
           //style.textAlign= 'center';
           style.webkitUserSelect = 'none';
           //style.paddingTop = '3px';
       }
    });

    //st.loadJSON(json);
    //st.compute();
    //st.onClick(st.root);
    //st.switchPosition('top','replot');

});
