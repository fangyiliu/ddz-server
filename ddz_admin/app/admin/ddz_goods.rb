ActiveAdmin.register DdzGoods do

  permit_params do
    permitted = []
    permitted << :goodsName
    permitted << :goodsDesc
    permitted << :goodsType
    permitted << :goodsProps
    permitted << :sortIndex
    permitted
  end

  index do
    selectable_column
    id_column
    column :goodsName
    column :goodsDesc
    column :goodsType
    column :goodsProps
    column :sortIndex
    column :createAt
    column :updateAt
    actions
  end

  filter :goodsName
  filter :goodsDesc
  filter :goodsType

  form do |f|
    f.inputs "DdzGoods Details" do
      f.input :goodsName
      f.input :goodsDesc
      f.input :goodsType
      #f.input :goodsProps
      f.input :sortIndex
    end
    f.actions
  end

end
