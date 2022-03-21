package model

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"sync"
	"uzume_backend/helper"
	"uzume_backend/test_helper"
)

// JsonAccessor
type JsonAccessor interface {
	ReadJson(path string) ([]byte, error)
	SaveJson(path string, v interface{}) error
}

func NewJsonAccessor() JsonAccessor {
	// if helper.IsTesting() {
	// 	return new(InMemory)
	// }

	return new(FileSystem)
}

// FileSystem
type FileSystem struct {
}

var fs_mutex sync.Mutex

func (fs *FileSystem) ReadJson(path string) ([]byte, error) {
	fs_mutex.Lock()
	defer fs_mutex.Unlock()

	bytes, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	return bytes, nil
}

func (fs *FileSystem) SaveJson(path string, v interface{}) error {
	fs_mutex.Lock()
	defer fs_mutex.Unlock()

	if helper.IsTesting() {
		if !strings.HasPrefix(path, test_helper.BuildFilePath("")) {
			return errors.New("テスト用フォルダ外へのアクセスです")
		}
	}

	json_data, err := json.Marshal(v)
	if err != nil {
		return err
	}

	json_indent, err := helper.JsonIndent(json_data)
	if err != nil {
		return err
	}

	if err := helper.MakeRouteDir(path); err != nil {
		return err
	}

	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	if _, err := file.Write(([]byte)(json_indent)); err != nil {
		return err
	}

	return nil
}

// InMemory
var memory = make(map[string]string)

type InMemory struct {
}

func (fs *InMemory) ReadJson(path string) ([]byte, error) {
	json_str, ok := memory[path]
	if !ok {
		return nil, fmt.Errorf("該当ファイルがメモリ上にありません path[%s]", path)
	}

	return []byte(json_str), nil
}

func (fs *InMemory) SaveJson(path string, v interface{}) error {
	switch vi := v.(type) {
	case string:
		memory[path] = vi
	default:
		var err error
		memory[path], err = structToBytes(v)
		if err != nil {
			return err
		}
	}

	return nil
}

func structToBytes(v interface{}) (string, error) {
	json_data, err := json.Marshal(v)
	if err != nil {
		return "", err
	}

	json_indent, err := helper.JsonIndent(json_data)
	if err != nil {
		return "", err
	}

	return json_indent, nil
}
