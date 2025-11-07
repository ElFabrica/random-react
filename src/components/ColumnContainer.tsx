import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { TrashIcon } from "../icons/TrashIcon";
import type { Column, Id, Task } from "../types/Types";
import { CSS } from "@dnd-kit/utilities"
import { useMemo, useState } from "react";
import { PlusIcon } from "../icons/PlusIcon";
import { TaskCard } from "./TaskCard";

interface Props {
    column: Column
    tasks: Task[]
    deleteColumn: (id: Id) => void
    updateColumn: (id: Id, title: string) => void
    createTask: (columnId: Id) => void
    deleteTask: (id: Id) => void
    updateTask: (id: Id, content: string) => void
}

export function ColumnContainer({
    column,
    deleteColumn,
    updateColumn,
    createTask,
    deleteTask,
    updateTask,
    tasks
}: Props) {

    const [editMode, setEditMode] = useState(false);
    const tasksIds = useMemo(() => { return tasks.map((item) => item.id) }, [tasks])

    const { setNodeRef, attributes, transform, listeners, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column
        },
        disabled: editMode
    })
    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }


    if (isDragging) {
        return <div ref={setNodeRef} style={style}
            className="bg-[#0D1117]/60 
            w-[350px] h-[500px] max-h-[500px] 
            rounded-md border-2 border-[#ff57f7]
            flex flex-col"></div>
    }



    return <div
        ref={setNodeRef}
        className="bg-[#0D1117] w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
        style={style}
    >
        {/*Column title */}
        <div
            {...attributes}
            {...listeners}
            onClick={() => setEditMode(true)}
            className="bg-[#0D1117] text-md h-[60px] cursor-grab rounded-md rouded-b-none p-3 font-bold border-[#161C22] border-4 flex items-center justify-between">
            <div className="flex gap-2">

                <div className=" flex justify-center items-center bg-[#161C22] px-2 py-1 text-sm rounded-full">
                    {tasks.length}</div>

                {!editMode ? column.title :
                    <input
                        className="bg-[#000000] focus: border-[#ff5470] border rounded outline-none px-2"
                        value={column.title}
                        onChange={(e) => updateColumn(column.id, e.target.value)}
                        autoFocus
                        onBlur={() => setEditMode(false)}
                        onKeyDown={(e) => {
                            if (e.key !== "Enter") {
                                return
                            }
                            setEditMode(false)
                        }}
                    />}
            </div>
            <button
                onClick={() =>
                    deleteColumn(column.id)
                }
                className="px-1 py-1 rounded-full cursor-pointer"><TrashIcon /></button>
        </div>
        {/*Continer*/}
        <div className="flex grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
            <SortableContext items={tasksIds}>
                {tasks?.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        deleteTask={deleteTask}
                        updateTask={updateTask}
                    ></TaskCard>
                ))}
            </SortableContext>
        </div>

        {/*Footer */}
        <button className="flex gap-2 items-center border-[#161C22] border-2 rounded-md p-4 border-x-[#0D1117] hover: bg-[#0D1117] hover:text-[#ff5470] active:bg-[#000000]"
            onClick={() => createTask(column.id)

            }
        >
            <PlusIcon /> Add Task
        </button>

        {/*Footer*/}



    </div>
}