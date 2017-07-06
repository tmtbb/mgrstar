define([
    "jquery",
    "utils",
    "config",
    "dataAPI",
    "layer",
    "pagination",
    "remodal"
], function ($, utils, config, dataAPI) {
    console.log(dataAPI);

    var changeLineModal = $('[data-remodal-id=changeLineModal]').remodal();
    var body = $("body");

    var page = {
        init: function () {
            this.render();
            this.bindEvents();
        },
        render: function () {
            this.initModal();
            this.initEventBind();
            this.fnGetList({pageNum: 10}, true);
        },
        bindEvents: function () {
            this.onSearch();
            // this.onStopTrade();
        },
        initEventBind: function () {
            utils.initDatePicker();
        },
        initModal: function () {
            body.on("click", ".J_showChangeLine", function () {
                var $this = $(this);
                var oTd = $this.parents('tr').find('td');
                var orgName = oTd.eq(4).text();
                var nickname = oTd.eq(2).text();
                var phone = oTd.eq(3).text();
                var oForm = $(".changeLineModal .modalForm");
                oForm.find("input[name=orgName]").val(orgName);
                oForm.find("input[name=nickname]").val(nickname);
                oForm.find("input[name=phone]").val(phone);
                changeLineModal.open();
            });

            $(document).on('closed', '.remodal', function (e) {
                $(this).find(".modalForm")[0].reset();
            });
        },

        onSearch: function () {
            var _this = this;
            $(".J_search").on("click", function () {
                var oForm = $(".search-bar");
                var data = {
                    page: 1,
                    status: oForm.find("[name=status]").val(),
                    startTime: oForm.find("#dateStart").val(),
                    endTime: oForm.find("#dateEnd").val(),
                    nickname: oForm.find("[name=nickname]").val(),
                    phoneNum: oForm.find("input[name=phone]").val()
                };
                _this.fnGetList(data, true);
            });

            $(".J_search_status").on("change", function () {
                var oForm = $(".search-bar");
                var data = {
                    page: 1,
                    status: oForm.find("[name=status]").val(),
                    startTime: oForm.find("#dateStart").val(),
                    endTime: oForm.find("#dateEnd").val(),
                    nickname: oForm.find("[name=nickname]").val(),
                    phoneNum: oForm.find("input[name=phone]").val()
                };
                _this.fnGetList(data, true);
            });
        },

        onStopTrade: function () {
            body.on("click", ".J_showStopTrade", function () {
                var $this = $(this);
                var id = $this.parents("tr").attr("data-id");
                var name = $this.parents("tr").find("td").eq(2).text();
                layer.confirm(
                    "警告！停止交易后用户能正常登录，但是无法进行交易",
                    {},
                    function () {
                        clientAPI.stopTrade({id: id}, function (result) {
                            layer.msg("操作成功");
                        });
                        layer.msg("操作成功");
                    })
            });
        },

        fnGetList: function (data, initPage) {
            var _this = this;
            var table = $(".data-container table");
            var status = $(".search-bar").find("[name=status]").val();
            data.status = status;
            dataAPI.getTransactionInfo(data, function (result) {
                console.log("获取客户管理列表 调用成功!");
                if (!result.list || result.list.length == "0") {
                    table.find("tbody").empty().html("<tr><td colspan='9'>暂无记录</td></tr>");
                    $(".pagination").hide();
                    return false;
                }
                var oTr,
                    checkTd = '<td><input type="checkbox"></td>';

                $.each(result.list, function (i, v) {

                    var xuTd   = '<td>' + v.id + '</td>';

                   // var starcodeTd = '<td>' + (v.starcode?v.starcode:0) + '</td>';

                    // var buyNameTd = '<td>' + v.buy_name + '</td>';
                    // var buyPhoneTd = '<td>' + v.buy_phone + '</td>';
                    //
                    // var sellNameTd = '<td>' + v.sell_name + '</td>';
                    // var sellPhoneTd = '<td>' + v.sell_phone + '</td>';

                    var nameTd = '<td>' + v.name + '</td>';
                    var phoneTd = '<td>' + v.phone + '</td>';

                    var type_member = v.member?v.member.name:'';
                    var type_agent = v.agent?v.agent.nickname:'';
                    var type_agent_sub = v.agent_sub?v.agent_sub.nickname:'';

                    var type_info = '<td>' +  type_member + ',' + type_agent + ',' + type_agent_sub +'</td>';


                    var order_numTd = '<td>' + v.order_num + '</td>';
                    var order_priceTd = '<td>' + v.order_price+ '</td>';


                    oTr +=
                        '<tr class="fadeIn animated" data-id="' + v.uid + '">'
                        + checkTd + xuTd + phoneTd + nameTd  + type_info + order_numTd
                        + order_priceTd +
                        '</tr>';

                });

                if(result.status == 1){  //买家
                    $('#name_id').html('买家手机号');
                    $('#phone_id').html('买家姓名');

                }else if(result.status == 2){ //卖家
                    $('#name_id').html('卖家手机号');
                    $('#phone_id').html('卖家姓名');
                }else{
                    $('#name_id').html('未知手机号');
                    $('#phone_id').html('未知姓名');
                }


                table.find("tbody").empty().html(oTr);
                if (initPage) {
                    var pageCount = result.totalPages;
                    if (pageCount > 0) {
                        console.log("页数：" + pageCount);
                        $(".pagination").show().html("").createPage({
                            pageCount: pageCount,
                            current: 1,
                            backFn: function (p) {
                                var newData = data;
                                newData.page = p;
                                _this.fnGetList(data)
                            }
                        })
                    }
                }
            });


        }

    };
    page.init();

});
