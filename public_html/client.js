function NoteCell(html, id, name){
    this.data = { html:html };
    this.id = id;
    this.name = name;
    this.children = new Array();
    this.addChild = function(html, id, name){
        this.children.push(new NoteCell(html, id, name));
    }
}
function Note(){
    this.list= new Array();
    this.tree = new NoteCell();
    
    this.addList = function(img_link_url, img_url, dst_url, dst_uname, src_url, src_uname){
        this.list.push({
            img_link_url : img_link_url,
            img_url      : img_url,
            dst_url      : dst_url,
            dst_uname    : dst_uname,
            src_url      : src_url,
            src_uname    : src_uname
        });
    }
    this.getTreeByName = function(name, obj){
        for(var i in obj){
            if(i === "name"){
                if(obj[i] === name) return obj;
            }
            if(i === "children"){
                for(var j in obj[i]){
                    var res = this.getTreeByName(name, obj[i][j]);
                    if(res === "notFound") continue;
                    return res;
                }
                return "notFound";
            }
        }
        return "notFound";
    }
    this.listToTree = function(){
        for(var i = this.list.length - 1; i >= 0; i--){
            var noteCell = this.list[i];
            var html = '<a href="'+ noteCell.dst_url +'"><img src="'+ noteCell.img_url + '">'+ noteCell.dst_uname +'</a>';
            var id = this.list.length - 1 - i;
            var name = noteCell.dst_uname;
            
            // when first loop. create initial note
            if(id === 0){       
                this.tree = new NoteCell(html, id, name);
                continue;
            }
            var src_note = this.getTreeByName(noteCell.src_uname, this.tree);
            if(src_note === "notFound") continue;
            src_note.addChild(html, id, name);
        }
    }
}



var note;
var st;
$(function(){
    console.log("start");

    //url = "http://strobot.tumblr.com/post/18123513647/kamatama-udon-cherrypin";

    $("#button").click(function(){
        note = new Note();
        var url = $("#textUrl").val();
        $.get("/",{"q":url},function(res){
            $("#notedata").append(res);
            $("#notedata li[class*=reblog]").each(function(){
                if(this.children[1].childElementCount == 1){    // foo posted this
                    note.addList(
                        this.children[0].href,                  //img_link_url
                        this.children[0].children[0].src,       //img_url
                        this.children[1].children[0].href,      //dst_url
                        this.children[1].children[0].innerText, //dst_usrname
                        null,                                   //src_url
                        null                                    //src_usrname
                    );
                } else {
                    note.addList(
                        this.children[0].href,                  //img_link_url
                        this.children[0].children[0].src,       //img_url
                        this.children[1].children[0].href,      //dst_url
                        this.children[1].children[0].innerText, //dst_usrname
                        this.children[1].children[1].href,      //src_url
                        this.children[1].children[1].innerText  //src_usrname
                    );
                }
            })
        note.listToTree();
        $("#graph").empty(); 
        st = new $jit.ST({
           injectInto: 'graph',
           //width: 1700,
           width: document.body.clientWidth,
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
               console.log(node);
           },

           onAfterCompute: function(){
               console.log("done");
           },
           onCreateLabel: function(label, node){
               label.id = node.id; 
               label.innerHTML = node.data.html;
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

        st.loadJSON(note.tree);
        st.compute();
        st.onClick(st.root);
        st.switchPosition('top','replot');
        })
    })
    //$("#notedata").append(html);
    //notehtml = Jquery(html);
    //$("#notedata li[class*=reblog]").css("background-color", "yellow")
    //$("#notedata li[class*=reblog]").each(function(){
    //    //console.log(this);
    //    if(this.children[1].childElementCount == 1){    // foo posted this
    //        note.addList(
    //            this.children[0].href,                  //img_link_url
    //            this.children[0].children[0].src,       //img_url
    //            this.children[1].children[0].href,      //dst_url
    //            this.children[1].children[0].innerText, //dst_usrname
    //            null,      //src_url
    //            null //src_usrname
    //            );
    //    } else {
    //        note.addList(
    //            this.children[0].href,                  //img_link_url
    //            this.children[0].children[0].src,       //img_url
    //            this.children[1].children[0].href,      //dst_url
    //            this.children[1].children[0].innerText, //dst_usrname
    //            this.children[1].children[1].href,      //src_url
    //            this.children[1].children[1].innerText //src_usrname
    //            );
    //    }
    //});
    //note.listToTree();


    //st.loadJSON(note.tree);
    //st.compute();
    //st.onClick(st.root);
    //st.switchPosition('top','replot');

});
