// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: permission_insert.sql

package db

import (
	"context"
	"database/sql"
)

const insertPermission = `-- name: InsertPermission :exec
INSERT INTO ` + "`" + `permissions` + "`" + ` (
    id,
    workspace_id,
    name,
    description,
    created_at_m
) VALUES (
    ?,
    ?,
    ?,
    ?,
    ?
)
`

type InsertPermissionParams struct {
	ID          string         `db:"id"`
	WorkspaceID string         `db:"workspace_id"`
	Name        string         `db:"name"`
	Description sql.NullString `db:"description"`
	CreatedAt   int64          `db:"created_at"`
}

// InsertPermission
//
//	INSERT INTO `permissions` (
//	    id,
//	    workspace_id,
//	    name,
//	    description,
//	    created_at_m
//	) VALUES (
//	    ?,
//	    ?,
//	    ?,
//	    ?,
//	    ?
//	)
func (q *Queries) InsertPermission(ctx context.Context, db DBTX, arg InsertPermissionParams) error {
	_, err := db.ExecContext(ctx, insertPermission,
		arg.ID,
		arg.WorkspaceID,
		arg.Name,
		arg.Description,
		arg.CreatedAt,
	)
	return err
}
