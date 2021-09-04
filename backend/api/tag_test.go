package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"uzume_backend/model"
	"uzume_backend/test_helper"

	"github.com/labstack/echo"
	"github.com/stretchr/testify/assert"
)

// タグ一覧の取得に成功すること
func TestGetTags_success(t *testing.T) {
	test_helper.InitializeTest()
	router := RouteInit()

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDir()

	config := new(model.Config)
	config.Load()
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	tags := model.NewTags(workspace)
	tag1, _ := tags.CreateNewTag("タグ1")
	tag2, _ := tags.CreateNewTag("タグ2")
	tag3, _ := tags.CreateNewTag("タグ3")
	tag4, _ := tags.CreateNewTag("タグ4")

	token, _ := model.GenerateAccessToken(workspace.Id)

	body, _ := json.Marshal(struct {
		WorkspaceId string `json:"workspace_id"`
	}{
		WorkspaceId: workspace.Id,
	})
	req := httptest.NewRequest("GET", "/api/v1/tags", bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	expect_body, _ := json.Marshal([]struct {
		TagId string `json:"tag_id"`
		Name  string `json:"name"`
	}{
		{
			TagId: tag1.Id,
			Name:  tag1.Name,
		},
		{
			TagId: tag2.Id,
			Name:  tag2.Name,
		},
		{
			TagId: tag3.Id,
			Name:  tag3.Name,
		},
		{
			TagId: tag4.Id,
			Name:  tag4.Name,
		},
	})

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.JSONEq(t, fmt.Sprintf(`{"tags": %s}`, string(expect_body)), string(rec.Body.Bytes()))
}

// 認証に失敗したとき、タグ一覧の取得に失敗すること
func TestGetTags_fail(t *testing.T) {
	test_helper.InitializeTest()
	router := RouteInit()

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDir()

	config := new(model.Config)
	config.Load()
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	tags := model.NewTags(workspace)
	tags.CreateNewTag("タグ1")
	tags.CreateNewTag("タグ2")
	tags.CreateNewTag("タグ3")
	tags.CreateNewTag("タグ4")

	model.GenerateAccessToken(workspace.Id)

	body, _ := json.Marshal(struct {
		WorkspaceId string `json:"workspace_id"`
	}{
		WorkspaceId: workspace.Id,
	})
	req := httptest.NewRequest("GET", "/api/v1/tags", bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid_token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

// タグの作成に成功すること
func TestPostTags_success(t *testing.T) {
	test_helper.InitializeTest()
	router := RouteInit()

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDir()

	config := new(model.Config)
	config.Load()
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	token, _ := model.GenerateAccessToken(workspace.Id)
	tags := model.NewTags(workspace)
	assert.Equal(t, 0, len(tags.List))

	body, _ := json.Marshal(struct {
		Name string `json:"name"`
	}{
		Name: "新タグ名",
	})
	req := httptest.NewRequest("POST", "/api/v1/tags", bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusCreated, rec.Code)
	tags.Load()
	assert.Equal(t, 1, len(tags.List))
	assert.Equal(t, 36, len(tags.List[0].Id))
	assert.Equal(t, "新タグ名", tags.List[0].Name)
}

// 認証に失敗したとき、タグの作成に失敗すること
func TestPostTags_fail(t *testing.T) {
	test_helper.InitializeTest()
	router := RouteInit()

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDir()

	config := new(model.Config)
	config.Load()
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	model.GenerateAccessToken(workspace.Id)
	tags := model.NewTags(workspace)
	assert.Equal(t, 0, len(tags.List))

	body, _ := json.Marshal(struct {
		Name string `json:"name"`
	}{
		Name: "新タグ名",
	})
	req := httptest.NewRequest("POST", "/api/v1/tags", bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid-token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	tags.Load()
	assert.Equal(t, 0, len(tags.List))
}

// タグの修正に成功すること
func TestPatchTags_success(t *testing.T) {
	test_helper.InitializeTest()
	router := RouteInit()

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDir()

	config := new(model.Config)
	config.Load()
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	tags := model.NewTags(workspace)
	tag, _ := tags.CreateNewTag("タグ")

	token, _ := model.GenerateAccessToken(workspace.Id)

	body, _ := json.Marshal(struct {
		Name string `json:"name"`
	}{
		Name: "新タグ名",
	})
	req := httptest.NewRequest("PATCH", fmt.Sprintf("/api/v1/tags/%s", tag.Id), bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNoContent, rec.Code)

	tags.Load()
	assert.Equal(t, tag.Id, tags.List[0].Id)
	assert.Equal(t, "新タグ名", tags.List[0].Name)
}

// 認証に失敗したとき、タグの修正に失敗すること
func TestPatchTags_fail(t *testing.T) {
	test_helper.InitializeTest()
	router := RouteInit()

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDir()

	config := new(model.Config)
	config.Load()
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	tags := model.NewTags(workspace)
	tag, _ := tags.CreateNewTag("タグ")

	model.GenerateAccessToken(workspace.Id)

	body, _ := json.Marshal(struct {
		Name string `json:"name"`
	}{
		Name: "新タグ名",
	})
	req := httptest.NewRequest("PATCH", fmt.Sprintf("/api/v1/tags/%s", tag.Id), bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid-token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)

	tags.Load()
	assert.Equal(t, tag.Id, tags.List[0].Id)
	assert.Equal(t, "タグ", tags.List[0].Name)
}

// タグの削除に成功すること
func TestDeleteTags_success(t *testing.T) {
	test_helper.InitializeTest()
	router := RouteInit()

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDir()

	config := new(model.Config)
	config.Load()
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	tags := model.NewTags(workspace)
	tag, _ := tags.CreateNewTag("タグ")

	token, _ := model.GenerateAccessToken(workspace.Id)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/api/v1/tags/%s", tag.Id), nil)
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNoContent, rec.Code)

	tags.Load()
	assert.Equal(t, 0, len(tags.List))
}

// 認証に失敗したとき、タグの削除に失敗すること
func TestDeleteTags_fail(t *testing.T) {
	test_helper.InitializeTest()
	router := RouteInit()

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDir()

	config := new(model.Config)
	config.Load()
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.WorkspaceList))
	config.Save()

	tags := model.NewTags(workspace)
	tag, _ := tags.CreateNewTag("タグ")

	model.GenerateAccessToken(workspace.Id)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/api/v1/tags/%s", tag.Id), nil)
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid-token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)

	tags.Load()
	assert.Equal(t, 1, len(tags.List))
}