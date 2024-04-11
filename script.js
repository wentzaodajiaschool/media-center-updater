$(document).ready(function () {
    console.log("載入完成");
    googleScriptURL =
        "https://script.google.com/macros/s/AKfycbweYmZZ0EE4Fn_x6m68i1SOy0BktFLjll3b9XSCSq8ok4U5d132hbg1sq05N7zAysmJFA/exec";

    //  FUNCTION  根據螢幕大小調整顯示的資料列
    function adjustPageLength() {
        // 獲取窗口的長寬比
        var aspectRatio = window.innerWidth / window.innerHeight;
        var pageLength;

        // 定義不同長寬比下的 pageLength 設定
        if (aspectRatio > 1.5) {
            // 桌面電腦通常有更大的長寬比
            pageLength = 8; // 桌面顯示更多列
        } else if (aspectRatio > 1 && aspectRatio <= 1.5) {
            // 平板或寬屏手機
            pageLength = 12; // 中等數量的列
        } else {
            // 手機等狹長屏幕
            pageLength = 16; // 顯示較少的列
        }

        // 更新 DataTables 的 pageLength
        var table = $("#sheetTable").DataTable();
        table.page.len(pageLength).draw(); // 使用 draw(false) 避免重繪整個表格
        console.log(
            "Adjusted page length to: " +
                pageLength +
                " based on aspect ratio: " +
                aspectRatio
        );
    }

    //  FUNCTION  過濾器功能
    var filterEnabled = false; // 過濾器開關的狀態

    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        if (!filterEnabled) {
            return true; // 如果過濾器被禁用，顯示所有行
        }

        // 使用 DataTables API 獲取當前行的 'enabled' 列的 DOM 元素
        var table = $("#sheetTable").DataTable();
        var columnNodes = table.column(7, { page: "all" }).nodes(); // 調整列索引
        var enabledNode = columnNodes[dataIndex]; // 獲取當前行的對應節點

        // 檢查該節點中的 checkbox 是否被勾選
        var isChecked = $(enabledNode)
            .find('input[type="checkbox"]')
            .prop("checked");

        return isChecked; // 根據 checkbox 的選中狀態過濾行
    });

    //  EVENT  過濾器開關按鈕
    $("#toggleFilterBtn").on("click", function () {
        filterEnabled = !filterEnabled; // 切換過濾器的啟用狀態
        $("#sheetTable").DataTable().draw(); // 重新繪製表格以應用過濾
    });

    //  EVENT  圖片上傳功能 /////
    //當點擊加號按鈕時，觸發隱藏的文件輸入的點擊事件
    $("#triggerUploadButton").on("click", function () {
        $("#fileInput").click();
    });

    // 處理文件選擇後的事件
    //  EVENT
    $("#fileInput").on("change", function () {
        // 這裡可以預留上傳邏輯
        if (this.files && this.files[0]) {
            // 例如：調用函數處理文件上傳
            uploadImageToImgur(this.files[0]);
        }
    });

    //  FUNCTION  上傳圖片到 Imgur
    function uploadImageToImgur(file) {
        console.log("uploadImageToImgur");
        // 顯示上傳中提示
        $("#saveStatus").html('<i class="fas fa-spinner fa-spin"></i>').show();

        var clientId = "a0a92307b538c2f";
        var formData = new FormData();
        formData.append("image", file);

        fetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
                Authorization: "Client-ID " + clientId,
            },
            body: formData,
            muteHttpExceptions: true,
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.success) {
                    $("#coverLinkField").val(result.data.link);
                    // 顯示圖片
                    $("#upload-display").removeAttr("hidden");
                    $("#upload-display").html(`
						<img src="${result.data.link}">
					`);
                    $("#saveStatus")
                        .html('<i class="fas fa-check"></i>完成')
                        .fadeOut(1000);
                } else {
                    $("#saveStatus").html("上傳失敗").show();
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                $("#saveStatus").html("上傳失敗").show();
            });
    }

    //  FUNCTION  手動重新加載 DataTables 數據時顯示載入提示
    function reloadTableData() {
        // 顯示載入中提示
        $("#loadStatus")
            .html('<i class="fas fa-spinner fa-spin"></i> 載入中...')
            .show();

        table.ajax.reload(function () {
            // 數據加載完成後的回調
            // 顯示完成提示並在1秒後淡出
            $("#loadStatus")
                .html('<i class="fas fa-check"></i> 完成!')
                .fadeOut(1000);
        });
    }

    // 初始化 DataTables
    var table = $("#sheetTable").DataTable({
        ajax: {
            url: googleScriptURL + "?action=read",
            beforeSend: function () {
                $("#loadStatus")
                    .html('<i class="fas fa-spinner fa-spin"></i> 載入中...')
                    .show();
            },
        },
        initComplete: function (settings, json) {
            $("#loadStatus")
                .html('<i class="fas fa-check"></i> 完成!')
                .fadeOut(1000); // 3秒後淡出
        },
        order: [[1, "desc"]],
        columns: [
            {
                data: null,
                defaultContent:
                    "<button class='btn editBtn'><i class='fas fa-edit'></i></button>",
                orderable: false,
            },
            { data: "id", responsivePriority: 1 }, // 編號
            {
                data: "title", // 標題
                orderable: false,
                responsivePriority: 1,
            },
            {
                data: "classes", // 班級
                orderable: false,
            },
            {
                data: "school", // 學校
                orderable: false,
            },
            {
                data: "category", // 類別
                orderable: false,
            },
            {
                data: "open", // 開放
                render: function (data, type, row) {
                    return `<input type="checkbox" class="dt-checkbox" data-id="${
                        row.id
                    }" ${data ? "checked" : ""}>`;
                },
                orderable: false,
                responsivePriority: 1,
            },
            {
                data: "playLink", // 播放連結
                orderable: false,
            },
            {
                data: "coverLink", // 封面連結
                orderable: false,
                responsivePriority: 2,
                render: function (data, type, row) {
                    if (data) {
                        return (
                            '<img src="' +
                            data +
                            '" style="width: 30px; height: 30px; object-fit: cover; object-position: center;">'
                        );
                    } else {
                        return ""; // 沒有封面圖片時的處理
                    }
                },
            },
        ],
        columnDefs: [
            {
                targets: "_all",
                className: "dt-center",
            },
        ],
        language: {
            url: "zh_Hant.json",
        },
        pageLength: 8, // 預設每頁顯示數量
        lengthChange: false, // 不顯示條目數量選擇器
        pagingType: "numbers", // 分頁按鈕顯示方式
        // info: false, // 不顯示分頁資訊
        drawCallback: function (settings) {
            // 為分頁按鈕添加 Bootstrap 風格
            // $('.paginate_button').addClass('btn btn-primary').removeClass('paginate_button');
            $(".dataTables_paginate").addClass("text-center"); // 確保分頁按鈕容器是置中的
        },
        responsive: true, // 啟用響應式設計
        className: 'compact'
    });

    //  EVENT  處理表格中checkbox的事件
    $("#sheetTable tbody").on("change", ".dt-checkbox", function () {
        $("#loadStatus")
            .html('<i class="fas fa-spinner fa-spin"></i> 更新中...')
            .show();

        var $tr = $(this).closest("tr");
        var data = table.row($tr).data();

        var isOpen = $(this).is(":checked");

        // 更新當前行的「開放」狀態
        data.open = isOpen;

        // 呼叫 Google Script 進行更新
        $.ajax({
            url: googleScriptURL + "?action=update",
            method: "POST",
            data: {
                action: "update",
                id: data.id,
                title: data.title, // 更新為您的新字段
                classes: data.classes, // 新增班級欄位
                school: data.school, // 新增學校欄位
                category: data.category, // 新增類別欄位
                open: isOpen ? "true" : "false", // 使用 open 字段並根據您的Google Script預期的格式調整布林值
                playLink: data.playLink, // 新增播放連結欄位
                coverLink: data.coverLink, // 使用新的封面連結字段替代 imageLink
            },
            success: function (response) {
                // 處理成功回調
                reloadTableData(); // 可能需要重新加載或更新 DataTables 來顯示最新的數據
            },
            error: function (response) {
                alert("更新失敗");
                // 處理錯誤情況
            },
        });
    });

    //  EVENT  處理表格中編輯按鈕的事件
    $("#sheetTable tbody").on("click", ".editBtn", function () {
        setModalToUpdateMode();
        $("#deleteBtn").show();
        var data = table.row($(this).parents("tr")).data();
        $("#recordId").data("id", data.id);
        // 填充 Modal 表單
        $("#titleField").val(data.title); // 更新為您的新字段
        $("#classField").val(data.classes); // 新增班級欄位填充
        $("#schoolField").val(data.school); // 新增學校欄位填充
        $("#categoryField").val(data.category); // 新增類別欄位填充
        // 更新封面圖片連結的處理
        $("#coverLinkField").val(data.coverLink);
        // 顯示圖片
        $("#upload-display").removeAttr("hidden");
        $("#upload-display").html(`
            <img src="${data.coverLink}" style="max-width: 100%; height: auto; object-fit: cover; object-position: center;">
        `);
        $("#playLinkField").val(data.playLink); // 新增播放連結欄位填充
        // 更新啟用狀態的處理
        $("#openField").prop(
            "checked",
            data.open === "true" || data.open === true
        );

        // 顯示 Modal
        $("#editModal").modal("show");

        // 監聽刪除按鈕的點擊事件
        $("#deleteBtn").on("click", function () {
            if (
                confirm(
                    "確定要刪除ID為 " +
                        $("#recordId").data("id") +
                        " 的紀錄嗎？"
                )
            ) {
                $("#saveStatus")
                    .html('<i class="fas fa-spinner fa-spin"></i> 刪除中...')
                    .show();

                // 發送 AJAX 請求來刪除紀錄
                $.ajax({
                    url: googleScriptURL + "?action=delete",
                    method: "POST",
                    data: {
                        action: "delete",
                        id: $("#recordId").data("id"),
                    },
                    success: function (response) {
                        // 更新提示為「完成」
                        $("#saveStatus").html(
                            '<i class="fas fa-check"></i> 完成!'
                        );
                        $("#saveStatus").hide();
                        $("#editModal").modal("hide");
                        // alert(JSON.stringify(response));
                        // 短暫延時後自動關閉 Modal
                        // 可能需要重新加載 DataTables 數據
                        reloadTableData();
                        setTimeout(function () {
                            $("#editModal").modal("hide");
                        }, 1000); // 2秒後關閉 Modal
                    },
                    error: function (xhr, status, error) {
                        alert(
                            "請告訴Roy出錯了，包含以下內容",
                            JSON.stringify(response)
                        );
                        $("#saveStatus")
                            .html('<i class="fas fa-times"></i> 刪除失敗')
                            .show();
                    },
                });
            }
        });
    });

    //   EVENT  處理表格中新增按鈕的事件
    $("#addNewBtn").on("click", function () {
        // 清空 Modal 表單中的所有輸入欄位
        $("#editForm")
            .find(
                'input[type="text"], input[type="checkbox"], input[type="hidden"]'
            )
            .val("");
        $("#editForm").find('input[type="checkbox"]').prop("checked", false);

        $("#deleteBtn").hide();
        // 顯示 Modal
        $("#editModal").modal("show");
        setModalToAddMode();
    });

    //  FUNCTION  檢查 Modal 表單是否完整
    function checkDataComplete() {
        // 定義一個變量，用於標記表單數據是否有效
        var isValid = true;
    
        // 移除先前的錯誤提示
        $(".form-control").removeClass("input-error"); // 假設所有輸入欄位都使用了 form-control 類
    
        // 逐一檢查每個字段是否為空，除了 openField
        $("#titleField , #schoolField, #categoryField, #playLinkField, #coverLinkField").each(function() {
            if (!$(this).val()) {
                // 如果字段為空，添加錯誤提示樣式並將 isValid 設置為 false
                $(this).addClass("input-error");
                isValid = false;
            }
        });
    
        if (!isValid) {
            // 如果有任何一個字段（除了 openField）為空，則顯示警告框並終止函數執行
            alert("除了「開放」外的所有字段都不能為空！");
            return false;
        }
        return true;
    }
    

    //  FUNCTION  設置 Modal 為「新增模式」
    function setModalToAddMode() {
        // 設置新增按鈕
        var addButtonHtml =
            '<button type="button" class="btn btn-primary" id="addNewBtn-send">新增音檔資料</button>';
        $("#modalActionButtons").html(addButtonHtml);

        // 重置 Modal 標題為「新增資料」
        $("#editModalLabel").text("新增音檔資料");

        // 重置 Modal 圖片
        $("#upload-display").html(`
			<img src="https://i.imgur.com/ELtJ86C.png">
		`);

        // 新增數據的邏輯 TODO:
        $("#addNewBtn-send").on("click", function () {
            // 若檢查不完整，則不執行新增
            if (!checkDataComplete()) {
                return;
            }
            var updatedData = {
                title: $("#titleField").val(), // 維持不變
                classes: $("#classField").val(), // 新增班級
                school: $("#schoolField").val(), // 新增學校
                category: $("#categoryField").val(), // 新增類別
                playLink: $("#playLinkField").val(), // 新增播放連結
                coverLink: $("#coverLinkField").val(), // 新增封面連結
                open: $("#openField").is(":checked") ? "true" : "false", // 將 enabled 更改為 open
            };

            $("#saveStatus")
                .html('<i class="fas fa-spinner fa-spin"></i> 儲存中...')
                .show();

            // 發送 AJAX 請求來更新數據
            $.ajax({
                url: googleScriptURL + "?action=create",
                method: "POST",
                data: updatedData,
                success: function (response) {
                    // 更新提示為「完成」
                    $("#saveStatus").html('<i class="fas fa-check"></i> 完成!');
                    $("#saveStatus").hide();
                    $("#editModal").modal("hide");
                    // alert(JSON.stringify(response));
                    // 短暫延時後自動關閉 Modal
                    // 可能需要重新加載 DataTables 數據
                    reloadTableData();
                    setTimeout(function () {
                        $("#editModal").modal("hide");
                    }, 1000); // 2秒後關閉 Modal
                },
                error: function (response) {
                    alert(
                        "請告訴Roy出錯了，包含以下內容",
                        JSON.stringify(response)
                    );
                    $("#saveStatus")
                        .html('<i class="fas fa-times"></i> 儲存失敗')
                        .show();
                    // table.ajax.reload(); // 重新加載 DataTables
                },
            });
        });
    }

    //  FUNCTION  設置 Modal 為「更新模式」
    function setModalToUpdateMode() {
        // 設置更新按鈕
        var updateButtonHtml =
            '<button type="button" class="btn btn-primary" id="updateBtn">更新内容</button>';
        $("#modalActionButtons").html(updateButtonHtml);

        // 重置 Modal 標題為「編輯資料」
        $("#editModalLabel").text("編輯資料");

        // 更新數據的邏輯
        $("#updateBtn").on("click", function () {
            // 若檢查不完整，則不執行更新
            if (!checkDataComplete()) {
                return;
            }
            var updatedData = {
                id: $("#recordId").data("id"),
                title: $("#titleField").val(),
                classes: $("#classField").val(),
                school: $("#schoolField").val(),
                category: $("#categoryField").val(),
                playLink: $("#playLinkField").val(),
                coverLink: $("#coverLinkField").val(),
                open: $("#openField").is(":checked") ? "true" : "false",
            };

            $("#saveStatus")
                .html('<i class="fas fa-spinner fa-spin"></i> 儲存中...')
                .show();

            // 發送 AJAX 請求來更新數據
            $.ajax({
                url: googleScriptURL + "?action=update",
                method: "POST",
                data: updatedData,
                success: function (response) {
                    // 更新提示為「完成」
                    $("#saveStatus").html('<i class="fas fa-check"></i> 完成!');
                    $("#saveStatus").hide();
                    $("#editModal").modal("hide");
                    // alert(JSON.stringify(response));
                    // 短暫延時後自動關閉 Modal
                    // 可能需要重新加載 DataTables 數據
                    reloadTableData();
                    setTimeout(function () {
                        $("#editModal").modal("hide");
                    }, 1000); // 2秒後關閉 Modal
                },
                error: function (response) {
                    alert(
                        "請告訴Roy出錯了，包含以下內容",
                        JSON.stringify(response)
                    );
                    $("#saveStatus")
                        .html('<i class="fas fa-times"></i> 儲存失敗')
                        .show();
                    // table.ajax.reload(); // 重新加載 DataTables
                },
            });
        });
    }

    // 調整資料列顯示數量
    $(window).resize(adjustPageLength); // 窗口大小變化時重新調整
});
