package model

import (
	"encoding/json"
	"fmt"
	"os/user"
	"path/filepath"
	"sync"
	"time"
	"uzume_backend/helper"
	"uzume_backend/test_helper"
)

const (
	ACCESS_TOKEN_EXPIRE_DATE = 7
)

type AccessTokenInfo struct {
	WorkspaceId string    `json:"workspace_id"`
	AccessToken string    `json:"access_token"`
	GeneratedAt time.Time `json:"generated_at"`
}

type AccessToken struct {
	FilePath        string            `json:"-"`
	AccessTokenList []AccessTokenInfo `json:"access_token_list"`
}

func NewAccessToken() (*AccessToken, error) {
	access_token := new(AccessToken)
	if err := access_token.Load(); err != nil {
		return nil, err
	}

	return access_token, nil
}

func (a *AccessToken) Load() error {
	if IsE2ETest {
		usr, _ := user.Current()
		a.FilePath = filepath.Join(usr.HomeDir, "/.uzume/e2e-test/access_token.json")
	} else if helper.IsTesting() {
		a.FilePath = test_helper.BuildFilePath("/.uzume/access_token.json")
	} else {
		usr, _ := user.Current()
		a.FilePath = filepath.Join(usr.HomeDir, "/.uzume/access_token.json")
	}

	if !helper.FileExists(a.FilePath) {
		fmt.Printf("[AccessToken Model] file not exists. [%s]", a.FilePath)
		return nil
	}

	json_accessor := NewJsonAccessor()

	bytes, err := json_accessor.ReadJson(a.FilePath)
	if err != nil {
		fmt.Printf("[AccessToken Model] faild to read json file. [%s]", a.FilePath)
		return err
	}
	if err := json.Unmarshal(bytes, a); err != nil {
		fmt.Printf("[AccessToken Model] faild to unmarshal json file. [%s]", a.FilePath)
		return err
	}

	return nil
}

func (a *AccessToken) Save() error {
	json_accessor := NewJsonAccessor()
	if err := json_accessor.SaveJson(a.FilePath, a); err != nil {
		return err
	}

	return nil
}

func (a *AccessToken) GetWorkspaceId(access_token string) (bool, string) {
	a.DeleteExpireToken()
	for _, at := range a.AccessTokenList {
		if at.AccessToken == access_token {
			return true, at.WorkspaceId
		}
	}

	return false, ""
}

func (a *AccessToken) DeleteExpireToken() {
	var new_list []AccessTokenInfo
	for _, access_token := range a.AccessTokenList {
		if !access_token.GeneratedAt.Before(time.Now().AddDate(0, 0, -ACCESS_TOKEN_EXPIRE_DATE)) {
			new_list = append(new_list, access_token)
		}
	}

	a.AccessTokenList = new_list
}

var generate_access_token_mutex sync.Mutex

func GenerateAccessToken(workspace_id string) (string, error) {
	generate_access_token_mutex.Lock()
	defer generate_access_token_mutex.Unlock()

	access_token_info := new(AccessTokenInfo)
	access_token_info.WorkspaceId = workspace_id
	access_token_info.AccessToken = helper.SecureRandomStr(18)
	access_token_info.GeneratedAt = time.Now()

	access_token := new(AccessToken)
	if err := access_token.Load(); err != nil {
		return "", err
	}

	access_token.DeleteExpireToken()

	access_token.AccessTokenList = append(access_token.AccessTokenList, *access_token_info)
	if err := access_token.Save(); err != nil {
		return "", err
	}

	return access_token_info.AccessToken, nil
}
