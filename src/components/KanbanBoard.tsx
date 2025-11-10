import { useMemo, useState } from "react";
import { PlusIcon } from "../icons/PlusIcon";
import type { Column, Id, Task } from "../types/Types";
import { ColumnContainer } from "./ColumnContainer";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { TaskCard } from "./TaskCard";

export function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>([])
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns])
    const [activeColumn, setActiveColumn] = useState<Column | null>(null)
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 2, //50px
        }
    }))

    function generateId() {
        /*Gerar id aleatório */
        const calc = (Math.floor(Math.random() * 1001))

        return calc.toString()
    }

    function createNewColumn() {
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`
        }
        setColumns([...columns, columnToAdd])

        console.log(columns)
    }

    function deleteColumn(id: Id) {
        const filteredColumn = columns.filter((col) => id !== col.id)
        setColumns(filteredColumn)
        const newTasks = tasks.filter((column) => id !== column.id)
        setTasks(newTasks)
    }
    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column)
            return;
        }
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task)
            return;
        }
    }
    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null)
        setActiveTask(null)
        const { active, over } = event
        if (!over) {
            return
        }
        if (active.data.current?.type !== "Column" || over.data.current?.type !== "Column") return
        const activeColumnId = active.id //Coluna capturada
        const overColumnId = over.id //Coluna que a coluna capturada está por cima 

        if (activeColumnId === overColumnId) return



        setColumns((columns) => {
            const activColumnIndex = columns.findIndex((col) => col.id === activeColumnId)
            const overColumnIndex = columns.findIndex(col => col.id === overColumnId)
            console.log("Chegou aqui", activColumnIndex, overColumnIndex)

            return arrayMove(columns, activColumnIndex, overColumnIndex) //reconstrou o array invertendo a posição de cada coluna
        })
    }
    function updateColumn(id: Id, title: string) {
        const newColumn = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title }
        })
        setColumns(newColumn)
    }
    function createTask(columnId: Id) {
        const newTask: Task = {
            id: generateId(),
            columnId,
            content: `Task ${tasks?.length + 1}`
        }
        setTasks([...tasks, newTask])
    }
    function deleteTask(id: Id) {
        const newTask = tasks.filter((task) => task.id !== id)

        setTasks(newTask)
    }
    function updateTask(id: Id, content: string) {
        const newTasks = tasks.map((task) => {
            if (task.id !== id) return task
            return { ...task, content }
        })

        setTasks(newTasks)
    }
    function onDragOver(event: DragOverEvent) {

        const { active, over } = event
        if (!over) {
            return
        }
        const activeId = active.id
        const overId = over.id
        if (activeId === overId) return
        const isActiveATask = active.data.current?.type === "Task"
        const isOverATask = over.data.current?.type === "Task"

        if (!isActiveATask) return


        if (isActiveATask && isOverATask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex(t => t.id === activeId)
                const overIndex = tasks.findIndex((t) => t.id === overId)

                tasks[activeIndex].columnId = tasks[overIndex].columnId

                return arrayMove(tasks, activeIndex, overIndex)
            })
        }
        const isOverAColumn = over.data.current?.type === "Column"

        if (activeTask && isOverAColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex(t => t.id === activeId)
                tasks[activeIndex].columnId = overId
                return arrayMove(tasks, activeIndex, activeIndex)
            })
        }
    }
    return <div
        className=" m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-40"

    >
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={(e) => onDragEnd(e)}
            onDragOver={onDragOver}
        >

            <div className="m-auto flex gap-4">
                <div className="flex gap-4">
                    <SortableContext items={columnsId}>

                        {columns.map((column) =>
                            <ColumnContainer
                                key={column.id}
                                column={column}
                                updateTask={updateTask}
                                updateColumn={updateColumn}
                                createTask={createTask}
                                deleteTask={deleteTask}
                                deleteColumn={() =>
                                    deleteColumn(column.id)}
                                tasks={tasks.filter((task) => task.columnId === column.id)}
                            />
                        )}
                    </SortableContext>
                </div>

                <button
                    className="flex gap-4 h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-[#0D1117] border-2 border-[#161C22] p-4 ring-[#ff6aa3]"
                    onClick={() => createNewColumn()}
                ><PlusIcon /> add Column</button>
            </div>
            {
                createPortal(
                    <DragOverlay>
                        {activeColumn && <ColumnContainer
                            column={activeColumn}
                            updateTask={updateTask}
                            deleteTask={deleteTask}
                            deleteColumn={deleteColumn}
                            updateColumn={updateColumn}
                            createTask={createTask}
                            tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                        />
                        }
                        {
                            activeTask && <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />
                        }
                    </DragOverlay>, document.body
                )
            }
        </DndContext>


    </div>
}