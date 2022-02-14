package model

import (
	"testing"
	"time"
	"uzume_backend/helper"
	"uzume_backend/test_helper"

	"github.com/stretchr/testify/assert"
)

// 初回Load
func TestJsonAccessorLoad_first(t *testing.T) {
	test_helper.InitializeTest()
	access_token, err := NewAccessToken()
	assert.NoError(t, err)

	file_path := test_helper.BuildFilePath("/.uzume/access_token.json")
	assert.Equal(t, helper.FileExists(file_path), false)
	assert.Equal(t, access_token.Load(), nil)
	assert.Equal(t, len(access_token.AccessTokenList), 0)
}

// Load 2回目以降
func TestJsonAccessorLoad(t *testing.T) {
	test_helper.InitializeTest()
	access_token, err := NewAccessToken()
	assert.NoError(t, err)
	json_accessor := NewJsonAccessor()

	file_path := test_helper.BuildFilePath("/.uzume/access_token.json")
	at := new(AccessToken)
	at.AccessTokenList = append(at.AccessTokenList, AccessTokenInfo{
		WorkspaceId: "test_workspace_id",
		AccessToken: "test_access_token",
		GeneratedAt: time.Now(),
	})
	json_accessor.SaveJson(file_path, at)

	assert.Equal(t, true, helper.FileExists(file_path))
	assert.Equal(t, nil, access_token.Load())
	assert.Equal(t, 1, len(access_token.AccessTokenList))
	assert.Equal(t, "test_workspace_id", access_token.AccessTokenList[0].WorkspaceId)
	assert.Equal(t, "test_access_token", access_token.AccessTokenList[0].AccessToken)
}

func TestJsonAccessorSave(t *testing.T) {
	test_helper.InitializeTest()
	access_token, err := NewAccessToken()
	assert.NoError(t, err)
	file_path := test_helper.BuildFilePath("/.uzume/access_token.json")

	assert.Equal(t, false, helper.FileExists(file_path))
	access_token.AccessTokenList = append(access_token.AccessTokenList, AccessTokenInfo{
		WorkspaceId: "test_workspace_id",
		AccessToken: "test_access_token",
		GeneratedAt: time.Now(),
	})
	access_token.Save()
	assert.Equal(t, true, helper.FileExists(file_path))

	access_token2, _ := NewAccessToken()
	access_token2.Load()
	assert.Equal(t, "test_workspace_id", access_token2.AccessTokenList[0].WorkspaceId)
	assert.Equal(t, "test_access_token", access_token2.AccessTokenList[0].AccessToken)
}

func TestJsonAccessorGetWorkspaceId(t *testing.T) {
	test_helper.InitializeTest()
	access_token, err := NewAccessToken()
	assert.NoError(t, err)
	access_token.AccessTokenList = append(access_token.AccessTokenList, AccessTokenInfo{
		WorkspaceId: "test_workspace_id",
		AccessToken: "test_access_token",
		GeneratedAt: time.Now(),
	})
	access_token.Save()

	ok, ws_id := access_token.GetWorkspaceId("test_access_token")
	assert.Equal(t, true, ok)
	assert.Equal(t, "test_workspace_id", ws_id)

	ok2, ws_id2 := access_token.GetWorkspaceId("noregisterd_access_token")
	assert.Equal(t, false, ok2)
	assert.Equal(t, "", ws_id2)
}

func TestJsonAccessorDeleteExpireToken(t *testing.T) {
	test_helper.InitializeTest()
	access_token, err := NewAccessToken()
	assert.NoError(t, err)
	access_token.AccessTokenList = append(access_token.AccessTokenList, AccessTokenInfo{
		WorkspaceId: "test_workspace_id",
		AccessToken: "test_access_token",
		GeneratedAt: time.Now(),
	})
	access_token.Save()
	assert.Equal(t, 1, len(access_token.AccessTokenList))

	access_token.AccessTokenList[0].GeneratedAt = time.Now().Add(-7*24*time.Hour + time.Hour)
	access_token.Save()
	access_token.DeleteExpireToken()
	assert.Equal(t, 1, len(access_token.AccessTokenList))

	access_token.AccessTokenList[0].GeneratedAt = time.Now().Add(-7 * 24 * time.Hour)
	access_token.Save()
	access_token.DeleteExpireToken()
	assert.Equal(t, 0, len(access_token.AccessTokenList))
}

func TestJsonAccessorGenerateAccessToken(t *testing.T) {
	test_helper.InitializeTest()

	token, _ := GenerateAccessToken("some_workspace_id")
	assert.Equal(t, 36, len(token))

	access_token, err := NewAccessToken()
	assert.NoError(t, err)
	access_token.Load()
	assert.Equal(t, 1, len(access_token.AccessTokenList))

	ok, ws_id := access_token.GetWorkspaceId(token)
	assert.Equal(t, true, ok)
	assert.Equal(t, "some_workspace_id", ws_id)
}
