package api

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"
	"uzume_backend/model"
	"uzume_backend/test_helper"

	"github.com/labstack/echo"
	"github.com/steinfletcher/apitest"
	"github.com/stretchr/testify/assert"
)

// ワークスペース一覧の取得に成功すること
func TestGetWorkspaces(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	json_accessor := model.NewJsonAccessor()
	configFilePath := test_helper.BuildFilePath("/.uzume/config.json")

	// configファイル作成
	c := new(model.Config)
	c.WorkspaceList = []model.WorkspaceInfo{
		{
			Path:        test_helper.BuildFilePath("workspace1.uzume"),
			WorkspaceId: "96174de5-c33b-f642-b1e3-c514b100e5ee",
			Name:        "ワークスペース1",
		},
		{
			Path:        test_helper.BuildFilePath("workspace2.uzume"),
			WorkspaceId: "b3a3e87e-838c-c5fd-ed7e-ad2d301ac3d0",
			Name:        "ワークスペース2",
		},
	}
	json_accessor.SaveJson(configFilePath, c)

	// ワークスペース作成→availableのテスト用
	w := new(model.Workspace)
	w.Id = "b3a3e87e-838c-c5fd-ed7e-ad2d301ac3d0"
	w.Name = "ワークスペース2"
	w.Path = test_helper.BuildFilePath("workspace2.uzume")
	w.Save()

	apitest.New().
		Handler(router).
		Get("/api/v1/workspaces").
		Expect(t).
		Status(http.StatusOK).
		Assert(func(res *http.Response, req *http.Request) error {
			body, err := ioutil.ReadAll(res.Body)
			if err != nil {
				log.Fatal(err)
			}
			assert.JSONEq(t,
				`[
						{
							"workspace_id": "96174de5-c33b-f642-b1e3-c514b100e5ee",
							"name":         "ワークスペース1",
							"available":    false
						},
						{
							"workspace_id": "b3a3e87e-838c-c5fd-ed7e-ad2d301ac3d0",
							"name":         "ワークスペース2",
							"available":    true
						}
					]`,
				(string)(body))
			return nil
		}).
		End()
}

// ワークスペースの新規作成に成功すること
func TestPostWorkspaces_Success(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	c := new(model.Config)
	c.Save()

	workspace_path := test_helper.BuildFilePath("workspace1.uzume")

	apitest.New().
		Handler(router).
		Post("/api/v1/workspaces").
		FormData("name", "新規ワークスペース").
		FormData("path", workspace_path).
		Expect(t).
		Status(http.StatusCreated).
		Assert(func(res *http.Response, req *http.Request) error {
			body, err := ioutil.ReadAll(res.Body)
			if err != nil {
				log.Fatal(err)
			}
			w := new(model.Workspace)
			json.Unmarshal(body, w)
			assert.Equal(t, len(w.Id), 36)
			return nil
		}).
		End()

	w := new(model.Workspace)
	w.Path = workspace_path
	w.Load()

	assert.Equal(t, len(w.Id), 36)
	assert.Equal(t, w.Name, "新規ワークスペース")
	assert.Equal(t, w.Path, workspace_path)
}

// ワークスペースがディスクに既に存在するとき、新規作成に失敗すること
func TestPostWorkspaces_FailOnWorkspaceAlreadyExists_disk(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	c := new(model.Config)
	c.Save()

	workspace_path := test_helper.BuildFilePath("workspace1.uzume")

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = workspace_path
	workspace.CreateWorkspaceDirAndSave()

	apitest.New().
		Handler(router).
		Post("/api/v1/workspaces").
		FormData("name", "新規ワークスペース").
		FormData("path", workspace_path).
		Expect(t).
		Status(http.StatusBadRequest).
		End()
}

// 既存のワークスペースの登録に成功すること。また、既に存在するワークスペースだった場合はエラーになること
func TestPostWorkspacesAdd(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	c := new(model.Config)
	c.Save()
	assert.Equal(t, 0, len(c.WorkspaceList))

	workspace_path := test_helper.BuildFilePath("workspace10.uzume")

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース10"
	workspace.Path = workspace_path
	workspace.CreateWorkspaceDirAndSave()

	// 1回目は成功
	body, _ := json.Marshal(struct {
		WorkspacePath string `json:"workspace_path"`
	}{
		WorkspacePath: workspace.Path,
	})
	req := httptest.NewRequest("POST", "/api/v1/workspaces/add", bytes.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	// 応答確認
	assert.Equal(t, http.StatusCreated, rec.Code)
	w := new(model.Workspace)
	json.Unmarshal([]byte(rec.Body.String()), w)
	assert.Equal(t, len(w.Id), 36)

	// configファイル確認
	c.Load()
	assert.Equal(t, 1, len(c.WorkspaceList))

	// 2回目はID重複エラー
	req2 := httptest.NewRequest("POST", "/api/v1/workspaces/add", bytes.NewReader(body))
	req2.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec2 := httptest.NewRecorder()
	router.ServeHTTP(rec2, req2)
	// 応答確認
	assert.Equal(t, http.StatusBadRequest, rec2.Code)
	// configファイル確認
	c.Load()
	assert.Equal(t, 1, len(c.WorkspaceList))
}

// 存在しないワークスペースを登録したときエラーになること
func TestPostWorkspacesAdd_fail(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	c := new(model.Config)
	c.Save()
	assert.Equal(t, 0, len(c.WorkspaceList))

	workspace_path := test_helper.BuildFilePath("workspace10.uzume")

	body, _ := json.Marshal(struct {
		WorkspacePath string `json:"workspace_path"`
	}{
		WorkspacePath: workspace_path,
	})
	req := httptest.NewRequest("POST", "/api/v1/workspaces/add", bytes.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	// 応答確認
	assert.Equal(t, http.StatusBadRequest, rec.Code)

	// configファイル確認
	c.Load()
	assert.Equal(t, 0, len(c.WorkspaceList))
}

// ワークスペースへのログインに成功すること
func TestPostWorkspacesLogin_success(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDirAndSave()

	config, err := model.NewConfig()
	assert.NoError(t, err)
	config.AddWorkspace(*workspace)
	config.Save()

	apitest.New().
		Handler(router).
		Post("/api/v1/workspaces/login").
		FormData("workspace_id", workspace.Id).
		Expect(t).
		Status(http.StatusOK).
		End()
}

// ワークスペースIDが間違っているときログインに失敗すること
func TestPostWorkspacesLogin_fail(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDirAndSave()

	config, err := model.NewConfig()
	assert.NoError(t, err)
	config.AddWorkspace(*workspace)
	config.Save()

	apitest.New().
		Handler(router).
		Post("/api/v1/workspaces/login").
		FormData("workspace_id", "not-valid-workspace-id").
		Expect(t).
		Status(http.StatusBadRequest).
		End()
}

// ワークスペースのUPDATEに成功すること
func TestPatchWorkspaces_success(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDirAndSave()

	config, err := model.NewConfig()
	assert.NoError(t, err)
	config.AddWorkspace(*workspace)
	config.Save()

	token, _ := model.GenerateAccessToken(workspace.Id)

	body, _ := json.Marshal(struct {
		Name string `json:"name"`
	}{
		Name: "新ワークスペース",
	})
	req := httptest.NewRequest("PATCH", "/api/v1/workspaces", bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNoContent, rec.Code)

	workspace.Load()
	assert.Equal(t, "新ワークスペース", workspace.Name)

	config.Load()
	assert.Equal(t, 1, len(config.WorkspaceList))
	assert.Equal(t, "新ワークスペース", config.WorkspaceList[0].Name)
}

// access_tokenが間違っているとき、認証エラーになりデータはUPDATEされないこと
func TestPatchWorkspaces_fail(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDirAndSave()

	config, err := model.NewConfig()
	assert.NoError(t, err)
	config.AddWorkspace(*workspace)
	config.Save()

	// 生成はするが使用しない
	model.GenerateAccessToken(workspace.Id)

	body, _ := json.Marshal(struct {
		Name string `json:"name"`
	}{
		Name: "新ワークスペース",
	})
	req := httptest.NewRequest("PATCH", "/api/v1/workspaces", bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid-access-token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)

	workspace.Load()
	assert.Equal(t, "ワークスペース", workspace.Name)

	config.Load()
	assert.Equal(t, 1, len(config.WorkspaceList))
	assert.Equal(t, "ワークスペース", config.WorkspaceList[0].Name)
}

// ワークスペースの削除に成功すること
func TestDeleteWorkspaces_success(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDirAndSave()

	config, err := model.NewConfig()
	assert.NoError(t, err)
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	token, _ := model.GenerateAccessToken(workspace.Id)

	body, _ := json.Marshal(struct {
		WorkspaceId string `json:"workspace_id"`
	}{
		WorkspaceId: workspace.Id,
	})
	req := httptest.NewRequest("DELETE", "/api/v1/workspaces", bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNoContent, rec.Code)

	config.Load()
	assert.Equal(t, 0, len(config.WorkspaceList))
}

// access_tokenが間違っているとき、認証エラーになりデータはDELETEされないこと
func TestDeleteWorkspaces_fail(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDirAndSave()

	config, err := model.NewConfig()
	assert.NoError(t, err)
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	model.GenerateAccessToken(workspace.Id)

	body, _ := json.Marshal(struct {
		WorkspaceId string `json:"workspace_id"`
	}{
		WorkspaceId: workspace.Id,
	})
	req := httptest.NewRequest("DELETE", "/api/v1/workspaces", bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid-access-token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)

	config.Load()
	assert.Equal(t, 1, len(config.WorkspaceList))
}

// ワークスペースiconのアップロードと取得に成功すること
func TestPostAndGetWorkspaceIcon(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDirAndSave()

	config, err := model.NewConfig()
	assert.NoError(t, err)
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	token, _ := model.GenerateAccessToken(workspace.Id)

	multipart_body := new(bytes.Buffer)
	multipart_writer := multipart.NewWriter(multipart_body)
	image_file_binary := test_helper.WriteMultipartImageField(t, multipart_writer, "icon", "../fixture/testimage1.png")
	multipart_writer.Close() // ここでCloseしないとc.FormFileでunexpected EOFとなる

	// post
	req_post := httptest.NewRequest("POST", "/api/v1/workspaces/icon", multipart_body)
	req_post.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req_post.Header.Set(echo.HeaderContentType, multipart_writer.FormDataContentType())

	rec_post := httptest.NewRecorder()
	router.ServeHTTP(rec_post, req_post)

	assert.Equal(t, http.StatusCreated, rec_post.Code)

	// get
	req_get := httptest.NewRequest("GET", "/api/v1/workspaces/icon", nil)
	req_get.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req_get.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec_get := httptest.NewRecorder()
	router.ServeHTTP(rec_get, req_get)
	assert.Equal(t, http.StatusOK, rec_get.Code)
	test_helper.EqualBuffer(t, image_file_binary, rec_get.Body)
}

// access_tokenが間違っているとき、ワークスペースiconのアップロードと取得に失敗すること
func TestPostAndGetWorkspaceIcon_fail(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDirAndSave()

	config, err := model.NewConfig()
	assert.NoError(t, err)
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	model.GenerateAccessToken(workspace.Id)

	multipart_body := new(bytes.Buffer)
	multipart_writer := multipart.NewWriter(multipart_body)
	test_helper.WriteMultipartImageField(t, multipart_writer, "icon", "../fixture/testimage1.png")
	multipart_writer.Close() // ここでCloseしないとc.FormFileでunexpected EOFとなる

	// post
	req_post := httptest.NewRequest("POST", "/api/v1/workspaces/icon", multipart_body)
	req_post.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid-access-token"))
	req_post.Header.Set(echo.HeaderContentType, multipart_writer.FormDataContentType())

	rec_post := httptest.NewRecorder()
	router.ServeHTTP(rec_post, req_post)

	assert.Equal(t, http.StatusUnauthorized, rec_post.Code)

	// get
	req_get := httptest.NewRequest("GET", "/api/v1/workspaces/icon", nil)
	req_get.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid-access-token"))
	req_get.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec_get := httptest.NewRecorder()
	router.ServeHTTP(rec_get, req_get)
	assert.Equal(t, http.StatusUnauthorized, rec_get.Code)
}
